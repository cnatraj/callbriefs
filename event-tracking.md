# Event tracking

How CallBriefs tracks prospect visits to microsites. The output of this system is the **Story view** session feed — a chronological narrative of who looked at a brief, what they read, and how they engaged. See CLAUDE.md "Story view (the analytics USP)" for the product framing.

This is **not** analytics. We're not building a dashboard. We're building a stream of qualitative session stories.

---

## Core concepts

### Fingerprint
- localStorage UUID under key `cb.fingerprint`.
- Created the first time a microsite loads, persists indefinitely.
- Identifies a **device/browser**, not a person — same prospect on phone and laptop = two fingerprints (acceptable).
- Set once, then read on every subsequent visit.

### Session
- A bracketed visit. localStorage key `cb.session` = `{ id: uuid, created_at: ISO }`.
- On page load: if no session OR `created_at` is older than **12 hours** → create a new one.
- TTL is from `created_at`, **not** last activity. A long binge gets sliced into 12hr chunks (rare).
- Cleared from localStorage when `session_end` fires.

### Silent mode
- URL param `?track=false` disables tracking entirely.
- No fingerprint read or write, no session created, no events fired, no listeners attached.
- Used when the rep clicks "Open as prospect" from `BriefHero` — the button appends the param.
- No auth check; the param is the only mechanism. Keep it simple.

**The single write path is the `track-event` edge function.** All events — normal and unload — POST through `/functions/v1/track-event`. The function is deployed `--no-verify-jwt` and writes to `microsite_events` via service-role. No direct table writes from the browser; anon `INSERT` on `microsite_events` is revoked.

Why route through a function: (a) `sendBeacon` (the only reliable unload primitive) can't set the `apikey`/`Authorization` headers Supabase REST requires, so direct inserts during page unload silently fail to a CORS preflight that the browser kills before sending the POST; (b) one code path is easier to evolve and add validation/rate-limiting to than two.

**Tradeoff we accepted.** Earlier we relied on anon-only INSERT as a database-level guarantee that authenticated reps couldn't write events even without `?track=false`. Routing through the function (which uses service-role) drops that second layer. The URL flag is now the sole gate. Match the original design intent ("No auth check; the param is the only mechanism") and worth the simpler write path.

### Activity (for the idle timer)
- "Activity" means **our tracked events only** — not raw browser events like `mousemove`.
- Otherwise mouse jiggle would keep dead sessions alive.

---

## Session lifecycle

### `session_start`
Fires on page load when a new session is created. Deterministic — happens or doesn't, no edge cases.

### `session_end` (best-effort — two paths)

The browser doesn't reliably notify us when a tab closes, so we use two complementary mechanisms:

**1. Idle timer (3 minutes).** A `setTimeout` reset on every tracked event. When it fires, the session has been silent for 3min → end it. Works while the tab is alive.

**2. Tab close (`pagehide` + `sendBeacon` to the edge function).** A `pagehide` listener fires `session_end` via `navigator.sendBeacon()` against the `track-event` edge function. sendBeacon is purpose-built for unload telemetry: no preflight, the browser guarantees delivery best-effort even after the page is gone. Catches: closing the tab, navigation away, refresh, mobile backgrounding (mostly).

When `session_end` fires (either path):
- POST the event.
- `localStorage.removeItem('cb.session')` so the next page load starts a fresh session.

### Dangling sessions
Some sessions will never get a `session_end` event — browser crash, OS kill, force-quit, hard reboot. Rare but real.

We don't reconcile these with a server-side write. At **read time** during sessionization for the Story view, any session with no `session_end` event is treated as having ended at `last_event_at + 3min`. Render-time interpretation only.

### Multi-tab
localStorage is shared across same-origin tabs, so two open tabs of the same microsite share `cb.session` and race the idle timer. Acceptable for v1 — accurate enough, narrative reads fine ("Maya opened the brief twice in 2 minutes").

---

## Reliability summary

| Scenario                              | `session_end` captured? |
| ------------------------------------- | ----------------------- |
| Walks away, leaves tab open >3min     | ✓ idle timer            |
| Closes tab actively                   | ✓ via sendBeacon        |
| Refreshes / navigates away            | ✓ via sendBeacon        |
| Closes laptop lid                     | partial — depends on OS |
| Browser crash / force quit            | ✗ — read-time fallback  |
| Multiple tabs of same microsite       | races, last one wins    |

---

## Phasing

### Phase 1 — lifecycle scaffolding (current)
Build the infrastructure to manage fingerprints, sessions, and the start/end event lifecycle. **No content events yet** — just the bones.

Scope:
- Tracking module (`src/lib/tracking.js` or a composable). Single entry point: `initTracking(micrositeId)`.
- Fingerprint create-or-read.
- Session create-or-read with 12hr TTL check.
- `session_start` event on new session.
- 3min idle timer; resets on every tracked event; fires `session_end` on timeout.
- `pagehide` handler fires `session_end` via `sendBeacon`.
- Clear `cb.session` from localStorage when `session_end` fires.
- Silent-mode bail at the top of `initTracking` when `?track=false` is present.
- Append `?track=false` to the "Open as prospect" URL in `BriefHero`.
- Wire start/end events to the `microsite_events` table (existing schema; anon INSERT is already permitted).

Out of scope for Phase 1:
- Section-level events.
- CTA click events.
- Section dwell measurement.
- Story feed rendering.
- Notification surfaces.

### Phase 2 — events and tracking conventions

Two new event types:
- **`section_viewed`** — fires on viewport entry. **No threshold** (no "X% visible" or "Ns dwell" gate). Multiple visits to the same section = multiple events.
- **`cta_clicked`** — fires when a tracked element is clicked. In Phase 2, this means tab switches; other CTAs are deferred.

**No `time_spent_ms` written.** Each event's `created_at` is the only time signal — the server-side narrator infers dwell from gaps between adjacent events. The schema column stays for future use.

**Section naming — declarative.** Each section component owns a `data-section-name="..."` attribute on its outermost element. A page-level `IntersectionObserver` finds these elements and fires `section_viewed` with the attribute value as the `section` field. Names are flat strings: `header`, `greeting`, `what_we_heard`, `why_us`, `footer`. (Customer story and Closer ride along inside `why_us` for now — split later if we want finer granularity.)

**Click tracking — declarative.** Tracked elements carry:
- `data-tracking-event="cta_clicked"` — the event type.
- `data-tracking-cta="..."` — kind of click (`"tab"` for now).
- `data-tracking-target="..."` — specific target (e.g., the tab name).

A document-level `click` listener walks up via `closest('[data-tracking-event]')`, reads the attributes, fires. The `section` is auto-resolved by walking up to the nearest `[data-section-name]` ancestor — no need to repeat it on each tracked element.

**Schema upgrade.** Migration adds `fingerprint_id uuid` and `session_id uuid` to `microsite_events`, both indexed. Sessionization queries (Phase 3) lean on these constantly; jsonb path queries are slower than indexed columns. Phase 1 rows keep their `metadata.fingerprint_id` / `metadata.session_id`; **we don't backfill** — read paths handle both.

**Out of scope for Phase 2:**
- Other CTA instrumentation (mailto links, sticky CTA, internal anchors).
- Sub-section granularity (per-card events inside `WhyTab`).
- Story feed rendering — still Phase 3.
- Read-time sessionization or narrative generation — Phase 3.

### Phase 3 — Story view
- Sessionize raw events (server-side SQL view or store-side reducer; cluster by `fingerprint_id` + 30min idle window per CLAUDE.md, and treat dangling sessions per the rule above).
- Hybrid narrative generator: template for the timestamps/sections/durations + LLM for the qualitative read.
- Persist generated narratives so we don't pay LLM inference on every page load.
- Session feed UI replaces `StoryEmpty.vue` when `hasViews` flips true.
- Notification surfaces (bell icon, push, email digest).

---

## Decisions locked

**Phase 1 (lifecycle)**
- Tracking is suppressed via URL param `?track=false`, not via auth check.
- All events POST to the `track-event` edge function (service-role write, deployed `--no-verify-jwt`). Anon INSERT on `microsite_events` is revoked.
- Fingerprint has indefinite TTL.
- Session TTL = 12hr from `created_at`.
- Activity = tracked events only (not raw browser events).
- Session ID cleared from localStorage when `session_end` fires.
- No server-side reconciliation for dangling sessions; read-time interpretation only.

**Phase 2 (events)**
- New event types: `section_viewed` (viewport entry, no threshold) + `cta_clicked` (declarative via data attributes).
- No `time_spent_ms` written from the client; dwell inferred from event timestamps at read time.
- Multiple section visits in one session = multiple events; collapse at read time if useful.
- `fingerprint_id` and `session_id` are first-class columns. Phase 1 rows are not backfilled — read paths handle both shapes.
- Section identifiers live as `data-section-name="..."` on each section component's outermost element.
- Click events use `data-tracking-event` + `data-tracking-*` attributes, dispatched by a document-level delegate. `section` auto-resolves by walking up to the nearest `data-section-name` ancestor.
- Phase 2 instruments tab switches only; other CTAs deferred.

## Open questions (deferred to Phase 3)

- **Sub-section granularity.** Customer story and Closer currently roll up under `why_us`. If we want per-card narrative ("re-read the Acme testimonial three times") we split them into their own sections.
- **Other CTAs.** mailto links (`Greeting.email_rep`), the sticky bottom CTA, internal anchors. Add data attributes when we want them tracked.
- **Story feed UI + read-time sessionization** — Phase 3.
- **Notification surfaces** (bell icon, email digest, push) — Phase 3.
