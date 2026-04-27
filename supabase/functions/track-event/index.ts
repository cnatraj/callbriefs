// Edge function: track-event
// -----------------------------------------------------------------------------
// Single write path for prospect-side microsite analytics. The browser
// tracking module (src/lib/tracking.js) sends every event here:
//   - normal events: fetch POST
//   - unload events: navigator.sendBeacon (fire-and-forget)
//
// Why route through here instead of writing to the table directly:
//   - One code path on the client (no separate REST + sendBeacon paths).
//   - sendBeacon can't set the apikey/Authorization headers Supabase REST
//     requires; this function is deployed --no-verify-jwt so no headers
//     are needed.
//   - Server-side validation hook for malformed payloads.
//   - Once we revoke anon INSERT on microsite_events, this function
//     becomes the only write path.
//
// Deploy:
//   supabase functions deploy track-event --no-verify-jwt
// -----------------------------------------------------------------------------

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_EVENT_TYPES = new Set([
  "session_start",
  "session_end",
  "viewed",
  "section_viewed",
  "cta_clicked",
]);

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  // Parse defensively — sendBeacon-shipped Blobs sometimes arrive with
  // unexpected content-types depending on browser quirks. We just want
  // the JSON body.
  let body: any;
  try {
    const text = await req.text();
    if (!text) {
      return new Response("empty body", { status: 400, headers: corsHeaders });
    }
    body = JSON.parse(text);
  } catch {
    return new Response("invalid json", { status: 400, headers: corsHeaders });
  }

  // Minimum required fields. Keep the bar low — defensive validation,
  // not strict schema enforcement. The DB still has check constraints.
  if (!body || typeof body !== "object") {
    return new Response("body must be object", {
      status: 400,
      headers: corsHeaders,
    });
  }
  if (!body.microsite_id || typeof body.microsite_id !== "string") {
    return new Response("missing microsite_id", {
      status: 400,
      headers: corsHeaders,
    });
  }
  if (!ALLOWED_EVENT_TYPES.has(body.event_type)) {
    return new Response(`invalid event_type: ${body.event_type}`, {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Whitelist columns we actually want to write. Drops anything weird
  // the client tries to slip in.
  const row = {
    microsite_id: body.microsite_id,
    event_type: body.event_type,
    fingerprint_id: body.fingerprint_id ?? null,
    session_id: body.session_id ?? null,
    section: body.section ?? null,
    metadata: body.metadata ?? null,
  };

  const { error } = await supabase.from("microsite_events").insert(row);

  if (error) {
    console.error("[track-event] insert failed:", error);
    return new Response(error.message, { status: 500, headers: corsHeaders });
  }

  return new Response(null, { status: 204, headers: corsHeaders });
});
