// Edge function: process-document
// -----------------------------------------------------------------------------
// Triggered by a Supabase Database Webhook on INSERT into public.documents.
// Flow:
//   1. Fetch the document row (idempotency: bail if status != 'uploaded').
//   2. Flip status → 'processing'.
//   3. Download the file from storage.
//   4. Send to Claude (Sonnet 4.6) with the cached system prompt in
//      prompt.ts as the extraction brief.
//   5. Parse Claude's JSON response, store in documents.extracted_content.
//   6. Flip status → 'ready'. On any error, 'failed'.
//
// Deploy:
//   supabase functions deploy process-document --no-verify-jwt
//
// Required secret:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
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

// Chunked base64 conversion — avoids stack overflow on spread for large files.
const arrayBufferToBase64 = (buf: ArrayBuffer): string => {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

// Build the right content block for Claude based on the uploaded MIME type.
// Storage-layer MIME restrictions mean we only ever see these types, but
// this also acts as a defensive check.
// deno-lint-ignore no-explicit-any
const buildFileBlock = (mimeType: string, base64Data: string): any | null => {
  if (mimeType === "application/pdf") {
    return {
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: base64Data,
      },
    };
  }
  const SUPPORTED_IMAGES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
  ];
  if (SUPPORTED_IMAGES.includes(mimeType)) {
    return {
      type: "image",
      source: {
        type: "base64",
        media_type: mimeType,
        data: base64Data,
      },
    };
  }
  return null;
};

Deno.serve(async (req) => {
  let documentId: string | undefined;
  let supabase: ReturnType<typeof createClient> | undefined;

  try {
    const payload = await req.json();
    documentId = payload?.record?.id;
    if (!documentId) return json({ error: "Missing document id" }, 400);

    supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Idempotency guard — webhook retries shouldn't clobber in-flight work.
    const { data: doc, error: fetchErr } = await supabase
      .from("documents")
      .select("id, file_url, mime_type, status")
      .eq("id", documentId)
      .single();
    if (fetchErr) throw fetchErr;
    if (!doc) return json({ error: "Document not found" }, 404);
    if (doc.status !== "uploaded") {
      return json({ ok: true, skipped: true, status: doc.status });
    }

    // Flip to processing
    const { error: processErr } = await supabase
      .from("documents")
      .update({ status: "processing" })
      .eq("id", documentId);
    if (processErr) throw processErr;

    // Download file from storage
    const { data: blob, error: dlErr } = await supabase.storage
      .from("documents")
      .download(doc.file_url);
    if (dlErr) throw dlErr;

    const base64Data = arrayBufferToBase64(await blob.arrayBuffer());

    const fileBlock = buildFileBlock(doc.mime_type, base64Data);
    if (!fileBlock) {
      throw new Error(`Unsupported mime type: ${doc.mime_type}`);
    }

    // Call Claude. System prompt uses cache_control so repeated invocations
    // hit the prompt cache at ~10% input cost (min 2048 tokens to cache on
    // Sonnet 4.6; shorter prompts still work, just don't cache).
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
      ],
      messages: [
        {
          role: "user",
          content: [
            fileBlock,
            {
              type: "text",
              text: "Extract per the instructions in the system prompt. Return JSON only.",
            },
          ],
        },
      ],
    });

    // content is a discriminated union — narrow by .type before reading .text
    const textBlock = msg.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text content in Claude response");
    }

    const raw = textBlock.text.trim();
    let extracted: unknown;
    try {
      extracted = JSON.parse(raw);
    } catch {
      // Fallback: strip ```json ... ``` fences if Claude added them
      const cleaned = raw.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
      extracted = JSON.parse(cleaned);
    }

    const { error: readyErr } = await supabase
      .from("documents")
      .update({
        extracted_content: extracted,
        status: "ready",
      })
      .eq("id", documentId);
    if (readyErr) throw readyErr;

    console.log(
      `process-document ok: ${documentId} (cache_read=${
        msg.usage.cache_read_input_tokens ?? 0
      } tokens)`,
    );
    return json({ ok: true, documentId });
  } catch (err) {
    console.error("process-document error:", err);
    if (supabase && documentId) {
      await supabase
        .from("documents")
        .update({ status: "failed" })
        .eq("id", documentId);
    }
    return json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      500,
    );
  }
});
