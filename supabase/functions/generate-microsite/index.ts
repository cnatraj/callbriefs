// Edge function: generate-microsite
// -----------------------------------------------------------------------------
// Two trigger paths, same body:
//   1. Database Webhook on INSERT into public.calls — payload is { record: { id } }.
//   2. Direct invoke from the client for retry — payload is { callId }.
//
// Flow:
//   1. Resolve callId from payload (webhook or invoke shape).
//   2. Fetch the call. Bail if status is 'ready' or 'sent' (idempotency).
//      Flip 'failed' → 'processing' for the retry case.
//   3. Pull the workspace's `ready` knowledge docs.
//   4. Send to Claude (Sonnet 4.6) with prompt caching:
//        system block 1: SYSTEM_PROMPT (cached)
//        system block 2: knowledge bundle (cached, per-workspace stable)
//        user block:     transcript (uncached)
//   5. Parse Claude's JSON.
//   6. Insert (or update on retry) the microsites row, generate a slug.
//   7. Flip calls.status → 'ready'. On any error → 'failed'.
//
// Deploy:
//   supabase functions deploy generate-microsite --no-verify-jwt
//
// Required secret:
//   ANTHROPIC_API_KEY (already set for process-document)
// -----------------------------------------------------------------------------

import { createClient } from "npm:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompt.ts";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 1500;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

// 10-char URL-safe slug. Collision probability is negligible at our volume,
// but the unique constraint on microsites.slug catches the edge case.
const generateSlug = (): string => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  let s = "";
  for (const b of bytes) s += chars[b % chars.length];
  return s;
};

const buildKnowledgeBundle = (
  // deno-lint-ignore no-explicit-any
  docs: any[],
): string => {
  if (!docs || docs.length === 0) {
    return "<knowledge_library>\n  (empty — no knowledge articles in this workspace yet)\n</knowledge_library>";
  }
  const blocks = docs.map(
    (d) =>
      `<doc id="${d.id}" name=${JSON.stringify(d.name ?? "Untitled")} type="${
        d.type ?? "other"
      }">\n${JSON.stringify(d.extracted_content ?? {}, null, 2)}\n</doc>`,
  );
  return `<knowledge_library>\n${blocks.join("\n\n")}\n</knowledge_library>`;
};

Deno.serve(async (req) => {
  let callId: string | undefined;
  let supabase: ReturnType<typeof createClient> | undefined;

  try {
    const payload = await req.json();
    // Webhook: { record: { id } }   |   Direct invoke: { callId }
    callId = payload?.record?.id ?? payload?.callId;
    if (!callId) return json({ error: "Missing call id" }, 400);

    supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: call, error: fetchErr } = await supabase
      .from("calls")
      .select("id, org_id, workspace_id, transcript, status, created_by")
      .eq("id", callId)
      .single();
    if (fetchErr) throw fetchErr;
    if (!call) return json({ error: "Call not found" }, 404);

    // Idempotency: skip if already done. Allow processing → re-run from
    // failed (retry path).
    if (call.status === "ready" || call.status === "sent") {
      return json({ ok: true, skipped: true, status: call.status });
    }
    if (call.status === "failed") {
      const { error } = await supabase
        .from("calls")
        .update({ status: "processing" })
        .eq("id", callId);
      if (error) throw error;
    }

    // Pull the workspace's ready knowledge docs
    const { data: docs, error: docsErr } = await supabase
      .from("documents")
      .select("id, name, type, extracted_content")
      .eq("workspace_id", call.workspace_id)
      .eq("status", "ready")
      .order("created_at", { ascending: true });
    if (docsErr) throw docsErr;

    const knowledgeBundle = buildKnowledgeBundle(docs ?? []);

    const anthropic = new Anthropic({
      apiKey: Deno.env.get("ANTHROPIC_API_KEY")!,
    });

    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
        {
          type: "text",
          text: knowledgeBundle,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `TRANSCRIPT:\n\n${call.transcript ?? ""}\n\n` +
                `Generate the microsite JSON per the instructions and the knowledge library above. Return JSON only.`,
            },
          ],
        },
      ],
    });

    const textBlock = msg.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text content in Claude response");
    }

    const raw = textBlock.text.trim();
    let content: unknown;
    try {
      content = JSON.parse(raw);
    } catch {
      // Fallback: strip ```json ... ``` fences if Claude added them
      const cleaned = raw.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
      content = JSON.parse(cleaned);
    }

    // Upsert microsite — retry path may already have a row for this call.
    const { data: existing } = await supabase
      .from("microsites")
      .select("id")
      .eq("call_id", callId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("microsites")
        .update({ content })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("microsites").insert({
        org_id: call.org_id,
        workspace_id: call.workspace_id,
        call_id: callId,
        created_by: call.created_by,
        slug: generateSlug(),
        content,
        status: "draft",
      });
      if (error) throw error;
    }

    const { error: readyErr } = await supabase
      .from("calls")
      .update({ status: "ready" })
      .eq("id", callId);
    if (readyErr) throw readyErr;

    console.log(
      `generate-microsite ok: ${callId} (cache_read=${
        msg.usage.cache_read_input_tokens ?? 0
      } tokens, cache_write=${msg.usage.cache_creation_input_tokens ?? 0})`,
    );
    return json({ ok: true, callId });
  } catch (err) {
    console.error("generate-microsite error:", err);
    if (supabase && callId) {
      await supabase
        .from("calls")
        .update({ status: "failed" })
        .eq("id", callId);
    }
    return json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      500,
    );
  }
});
