// Edge function: narrate-session
// -----------------------------------------------------------------------------
// Triggered by a Supabase Database Webhook on INSERT into public.microsite_events
// where event_type = 'session_end'. Generates a per-session narrative AND
// regenerates the microsite's overall narrative in a single LLM call.
//
// Flow:
//   1. Receive webhook payload { record: { microsite_id, session_id, fingerprint_id, event_type, ... } }.
//   2. Bail if event_type != 'session_end' (defensive — webhook should also filter).
//   3. Insert microsite_session_narratives row with status='processing'.
//   4. Background work (EdgeRuntime.waitUntil):
//        - Fetch all events for this session_id.
//        - Fetch existing narratives for this microsite_id.
//        - Send to Claude (Sonnet 4.6) with the system prompt + bundled context.
//        - Parse JSON: { session, overall }.
//        - Update narrative row with narrative/signals/events_count, status='ready'.
//        - Update microsites.overall_narrative.
//   5. Retry once on LLM failure. After second failure: status='failed'.
//
// Deploy:
//   supabase functions deploy narrate-session --no-verify-jwt
// -----------------------------------------------------------------------------

import { createClient } from "npm:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompt.ts";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 2000;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

// Strip code fences / leading prose from a Claude response and return
// the parsed JSON object. Tolerant of common formatting drift.
const parseJsonResponse = (text: string): any => {
  const trimmed = text.trim();
  // Strip ```json ... ``` if present
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const raw = fenced ? fenced[1] : trimmed;
  return JSON.parse(raw);
};

const callLLM = async (userMessage: string) => {
  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });
  const block = res.content.find((b: any) => b.type === "text") as
    | { type: "text"; text: string }
    | undefined;
  if (!block) throw new Error("no text block in LLM response");
  return parseJsonResponse(block.text);
};

const callLLMWithRetry = async (userMessage: string) => {
  try {
    return await callLLM(userMessage);
  } catch (err) {
    console.error("[narrate-session] first LLM attempt failed:", err);
    return await callLLM(userMessage);
  }
};

// Build the user message: current session events + prior narratives.
// Microsite content is intentionally NOT included for MVP — section
// names are descriptive enough. TODO: pass microsite content for richer
// narration once we have it.
const buildUserMessage = (params: {
  micrositeId: string;
  sessionId: string;
  fingerprintId: string | null;
  events: any[];
  priorNarratives: any[];
}) => {
  const { micrositeId, sessionId, fingerprintId, events, priorNarratives } =
    params;

  const sessionEvents = events.map((e) => ({
    event_type: e.event_type,
    section: e.section,
    metadata: e.metadata,
    created_at: e.created_at,
  }));

  const prior = priorNarratives.map((n) => ({
    session_id: n.session_id,
    fingerprint_id: n.fingerprint_id,
    narrative: n.narrative,
    signals: n.signals,
    generated_at: n.generated_at,
  }));

  return JSON.stringify(
    {
      microsite_id: micrositeId,
      this_session: {
        session_id: sessionId,
        fingerprint_id: fingerprintId,
        events: sessionEvents,
      },
      prior_narratives: prior,
    },
    null,
    2,
  );
};

const narrate = async (narrativeId: string, record: any) => {
  const { microsite_id, session_id, fingerprint_id } = record;

  // Pull all events for this session, ordered by time.
  const { data: events, error: eventsErr } = await supabase
    .from("microsite_events")
    .select("event_type, section, metadata, created_at")
    .eq("session_id", session_id)
    .order("created_at", { ascending: true });

  if (eventsErr) {
    console.error("[narrate-session] failed to fetch events:", eventsErr);
    await markFailed(narrativeId);
    return;
  }

  // Pull prior narratives on this microsite (excluding this row's
  // session — it's the one we're narrating).
  const { data: priorNarratives, error: priorErr } = await supabase
    .from("microsite_session_narratives")
    .select("session_id, fingerprint_id, narrative, signals, generated_at")
    .eq("microsite_id", microsite_id)
    .neq("session_id", session_id)
    .eq("status", "ready")
    .order("generated_at", { ascending: true });

  if (priorErr) {
    console.error("[narrate-session] failed to fetch prior narratives:", priorErr);
    await markFailed(narrativeId);
    return;
  }

  const userMessage = buildUserMessage({
    micrositeId: microsite_id,
    sessionId: session_id,
    fingerprintId: fingerprint_id ?? null,
    events: events ?? [],
    priorNarratives: priorNarratives ?? [],
  });

  let result: any;
  try {
    result = await callLLMWithRetry(userMessage);
  } catch (err) {
    console.error("[narrate-session] LLM failed twice:", err);
    await markFailed(narrativeId);
    return;
  }

  const session = result?.session;
  const overall = result?.overall;
  if (!session || !overall) {
    console.error("[narrate-session] malformed LLM response:", result);
    await markFailed(narrativeId);
    return;
  }

  // Update the narrative row.
  const { error: updateErr } = await supabase
    .from("microsite_session_narratives")
    .update({
      narrative: session.narrative ?? null,
      signals: session.signals ?? null,
      events_count: events?.length ?? 0,
      status: "ready",
    })
    .eq("id", narrativeId);

  if (updateErr) {
    console.error("[narrate-session] failed to update narrative:", updateErr);
    await markFailed(narrativeId);
    return;
  }

  // Update the microsite's overall narrative snapshot.
  const { error: micrositeErr } = await supabase
    .from("microsites")
    .update({ overall_narrative: overall })
    .eq("id", microsite_id);

  if (micrositeErr) {
    console.error("[narrate-session] failed to update overall_narrative:", micrositeErr);
    // Don't fail the whole row — the per-session narrative is already saved.
  }
};

const markFailed = async (narrativeId: string) => {
  await supabase
    .from("microsite_session_narratives")
    .update({ status: "failed" })
    .eq("id", narrativeId);
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ error: "method not allowed" }, 405);
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const record = payload?.record;
  if (!record) {
    return json({ error: "missing record" }, 400);
  }

  // Defensive filter — webhook config should also gate this.
  if (record.event_type !== "session_end") {
    return json({ skipped: true });
  }

  if (!record.microsite_id || !record.session_id) {
    return json({ error: "missing fields" }, 400);
  }

  // Reserve the narrative row up front so we have an id and the
  // Story feed can show a 'narrating…' placeholder if it loads
  // mid-flight.
  const { data: inserted, error: insertErr } = await supabase
    .from("microsite_session_narratives")
    .insert({
      session_id: record.session_id,
      microsite_id: record.microsite_id,
      fingerprint_id: record.fingerprint_id ?? null,
      status: "processing",
    })
    .select("id")
    .single();

  if (insertErr || !inserted) {
    console.error("[narrate-session] failed to insert narrative row:", insertErr);
    return json({ error: "insert failed" }, 500);
  }

  // Fire-and-forget the actual narration so the webhook returns fast.
  // EdgeRuntime.waitUntil keeps the background promise alive past the
  // response.
  // @ts-ignore — EdgeRuntime is a Supabase Edge runtime global.
  EdgeRuntime.waitUntil(narrate(inserted.id, record));

  return json({ id: inserted.id, status: "processing" }, 202);
});
