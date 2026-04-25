# CallBriefs

B2B SaaS for sales reps. Turns a call transcript or recording into a personalized prospect-facing microsite ("brief") — with the prospect's priorities, next steps, and relevant collateral pulled from a shared Knowledge library. Mobile-first, sent to the buyer as a private link after a discovery call.

## Working style

- **Plan before implementing.** For any non-trivial task (more than a single obvious edit), propose the plan first — files to touch, approach, tradeoffs — and wait for a go-ahead. Exceptions: one-line fixes, explicit "next stage" / "just do it" instructions, and follow-on steps already pre-authorized.
- **Short sentences.** Prefer scannable bullets and terse prose over long explanations. Drop hedging.

## Quick reference

**Stack:** Vue 3 (`<script setup>`), Pinia, Vue Router 4, Vite, Tailwind. Supabase for auth + Postgres + edge functions. Anthropic API called from Supabase Edge Functions (never from the frontend).

**Commands:**
- `npm run dev` — Vite dev server
- `npm run build` — production build
- No test runner yet

**Companion docs (read when relevant):**
- [docs/callbriefs-architecture.md](docs/callbriefs-architecture.md) — code layout, service/store layer, conventions
- [docs/callbriefs-schema.sql](docs/callbriefs-schema.sql) — current consolidated DB schema (apply to a fresh Supabase project)
- [design.md](design.md) — design system (colors, typography, spacing, components)
- [sql/](sql/) — migration files, apply in order (see below)

## Architecture in 30 seconds

**Service-layer pattern.** Components never call Supabase directly:

```
Component → Pinia store → service (plain async fn) → Supabase
```

**Pinia stores (global state):**
- `stores/auth.js` — session, user, sign-in/out actions
- `stores/org.js` — memberships, `currentOrgId`, `currentOrg`, `currentRole`, `isOnboarded`, onboarding action

**Services (`src/services/`):** `auth.js`, `organizations.js`, `memberships.js`. Plain async functions, no Vue, no state. Add new ones per entity.

**Write patterns — pick per operation:**
- **SECURITY DEFINER RPC** for multi-table atomic writes, custom error messages, or complex validation. Today: `complete_onboarding` (org + membership + workspace in one transaction). Future: `accept_invite`. `organizations` and `memberships` have no INSERT grants to `authenticated` — the RPC is the only write path.
- **INSERT policy + grant** for single-table inserts with authorization expressible as a `WITH CHECK` predicate. Today: `workspaces` (owners/admins can insert via `supabase.from('workspaces').insert(...)`).
- **Rule of thumb:** start with the policy. Promote to an RPC when you need multi-step atomicity or custom error messaging.

## Permissions (UI gating)

Role → allowed actions map lives in [src/lib/permissions.js](src/lib/permissions.js). UI code uses the `useCan()` composable:

```vue
<script setup>
import { useCan } from '@/composables/useCan'
const can = useCan()
</script>
<template>
  <button v-if="can('workspace.create')">…</button>
</template>
```

`can(action)` reads `org.currentRole` reactively, so swapping workspaces/orgs updates gated UI automatically. Actions are dotted strings (`workspace.create`, `member.invite`, `org.delete`). When adding a new gated action, extend the arrays in `permissions.js` and use the same action string at the call site.

**Important:** this is UI-only gating. The DB (RLS policies + RPC role checks) is the authoritative enforcement. Keep the permissions map and the DB rules in sync when policy changes — when in doubt, the server wins.

**Multi-tenant.** Users belong to orgs via `memberships(org_id, user_id, role)`. A user can have 0+ orgs. `isOnboarded = memberships.length > 0`. Roles: `owner | admin | member`. One owner per org enforced by a unique partial index.

## Routing

`src/router/index.js` defines all routes + a single `beforeEach` guard.

**Route meta:**
- `meta: { layout: 'auth' | 'onboarding' | 'microsite' }` — bypass `AppShell` (sidebar + header). `App.vue` checks `isBareLayout` to decide.
- `meta: { public: true }` — bypass the auth guard (login, signup, auth callback, prospect-facing microsite).

**Guard order (critical, don't reorder):**
1. `await auth.init()` — reads session from storage / URL code exchange.
2. If authed, `await org.init()` — loads memberships.
3. Apply redirect rules.

Both `init()`s cache a shared promise so repeat calls are cheap. The first navigation fires during `app.use(router)` — *before* `app.mount()` — which is why the awaits are required.

**Redirects the guard handles:**
- Unauthenticated + private route → `/login`
- Authenticated + `/login` or `/signup` → `/briefs` (if onboarded) or `/onboarding`
- Authenticated + not onboarded + private route → `/onboarding`
- Authenticated + onboarded + `/onboarding` → `/briefs`

## Auth

- Providers: email/password + Google OAuth (via Supabase).
- Email confirmation: **OFF** in dev so signup produces a session immediately.
- Google OAuth redirects to `/auth/callback`, which refreshes the session, loads memberships, then routes based on `isOnboarded`.
- A Postgres trigger (`on_auth_user_created`) auto-inserts a `public.users` row on every `auth.users` insert — works for both email and OAuth signups, so app code never has to remember to create a profile.
- `.env` holds `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`. `.gitignore`'d.

## Migration pattern

SQL files in [sql/](sql/) are named `<adjective>-<animal>.sql` — arbitrary codenames so filenames don't collide. Each wraps `begin; … commit;`. Applied in order via the Supabase SQL Editor.

Migration log lives in [sql/README.md](sql/README.md) — newest on top.

For a cold start against a fresh Supabase project, run [docs/callbriefs-schema.sql](docs/callbriefs-schema.sql) — it's the consolidated final state.

## Gotchas

- **Tailwind body default is 14px.** Don't write `text-[14px]` — it's already the default in `tokens.css`. Only set explicit sizes when different from 14.
- **Top-level `await` is not in the build target.** `main.js` uses `.then()` chains. Don't convert to top-level await without also bumping the Vite target.
- **Router's first navigation fires during `app.use(router)`, not on mount.** The guard must `await auth.init()` and `await org.init()` because it can't assume the stores are populated yet.
- **New public tables need explicit `GRANT SELECT` to `authenticated`.** RLS only runs on top of table grants. Default privileges are set (see `galloping-deer.sql`) so any future tables auto-grant `SELECT` — but if you add a migration that bypasses this, remember.
- **Don't write self-referencing RLS policies.** A policy on `memberships` that queries `memberships` causes infinite recursion (silent empty result on some setups, 500 on others). Use a `SECURITY DEFINER` helper function if you need cross-row checks.
- **Profile row creation is automatic.** Don't manually insert `public.users` on signup — the trigger handles it. The name comes from `raw_user_meta_data->>'full_name'` (set by email signup) or `->>'name'` (set by Google).
- **`session.value` on the auth store is the source of truth for session state.** Driven by `onAuthStateChange`. Don't cache auth state elsewhere.

## What's built

- **Auth:** email signup/login, Google OAuth, `/auth/callback`, sign out.
- **Onboarding:** one-step workspace creation → `complete_onboarding` RPC (creates org + owner membership + default Sales workspace atomically) → `/briefs`.
- **App shell:** sidebar with org/workspace switcher (real data, functional), header with avatar-menu sign out.
- **Create Workspace drawer** — admin/owner only, gated via `can('workspace.create')`.
- **Knowledge feature (end-to-end):** upload PDFs + images (50 MB cap), list, delete (owner/admin), file drawer showing uploader, AI summary, and key topics. Workspace-scoped, with live status polling.
- **Edge function `process-document`** — triggered by a Supabase Database Webhook on `documents` insert; extracts via Claude Sonnet 4.6 with prompt caching; writes `extracted_content` JSON + transitions status. Image MIME is sniffed from magic bytes to tolerate mislabeled uploads.
- **Teammate profile visibility** via `shares_org_with()` SECURITY DEFINER helper — uploader names show up across the app for org members.
- **Permissions layer** (`src/lib/permissions.js` + `useCan()`) — UI gating by role (`owner`/`admin`/`member`).
- **Reusable primitives:** `AppModal`, `AppDrawer`, `StatusPill` (with pulsing dot during `processing`).
- **Prospect-facing microsite** at `/m/:id?` — static mock content.

## Not built yet (tracked roughly)

See [todo.md](todo.md) for the full list with context per item. High-level:

- **Invites flow** — `invites` table, `accept_invite` RPC, `/accept-invite` view. Email-based, tokenized.
- **Onboarding checklist** — spec written, paused.
- **Calls / microsites** — data model exists; UI still on static mocks under `src/data/*.js`.
- **Additional edge functions** — `process-transcript`, `generate-microsite` planned but not built.
- **RAG pipeline** — triggered when the 5-artifact-per-workspace cap gets raised (see todo.md).
- **docx / pptx extraction** — skipped for MVP; Claude doesn't ingest them natively.
- **Users management page, org switcher UI, workspace settings, org settings, account settings** — unbuilt surfaces.
