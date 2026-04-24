// -----------------------------------------------------------------------------
// System prompt for document extraction.
//
// REPLACE THE CONTENTS OF SYSTEM_PROMPT WITH YOUR ACTUAL EXTRACTION PROMPT.
//
// Guidelines for the prompt:
//  - Tell Claude to output valid JSON ONLY (no markdown fences, no prose).
//    The edge function has a fence-stripping fallback, but a clean prompt
//    avoids ambiguity.
//  - Describe the JSON schema you want back (keys, types, nullable fields).
//  - Describe any extraction rules, priorities, or edge cases.
//  - Keep the prompt stable across invocations — it's passed as `system`
//    with `cache_control: {type: "ephemeral"}`, so identical text across
//    calls is served from cache at ~10% of input cost.
//
// Prompt caching note (Sonnet 4.6): the minimum cacheable prefix is 2048
// tokens. Below that, the cache_control marker is a no-op (no error,
// cache_creation_input_tokens will just read 0). Short prompts still work
// — they just don't cache.
// -----------------------------------------------------------------------------

export const SYSTEM_PROMPT = `
You are a business document analyst. Your job is to read a document and extract all 
content into structured JSON — capturing everything a salesperson or customer success 
manager might need when personalizing outreach or generating follow-up materials.

Rules:
- Be concise. Short sentences. No filler words.
- summary: 2-3 short sentences max. Describe what the document is — its type and what it's designed to do. Not a summary of the content itself.
- key_topics: 3-5 short labels (4-5 words each). Think tags, not sentences.
- content: Freeform JSON. Extract everything present in the document — all text, stats, features, processes, proof points, and quotes. Do not filter, prioritize, or paraphrase. If a number or stat exists, include it. If a customer quote exists, reproduce it verbatim.
- If the document contains customer quotes or testimonials, reproduce them verbatim. Do not paraphrase.
- Do not invent or infer information not present in the document.
- Return only valid JSON. No markdown. No backticks. No preamble.

Output schema:
{
  "summary": "...",
  "key_topics": ["...", "..."],
  "content": { ... }
}
`;
