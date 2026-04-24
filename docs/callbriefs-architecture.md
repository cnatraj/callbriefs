# CallBriefs — Code Architecture

## Tech Stack
- **Frontend:** Vue 3 (`<script setup>`), Vue Router 4, Pinia, Tailwind CSS, Vite
- **Backend:** Supabase (auth, Postgres, storage, edge functions)
- **AI:** Anthropic API called from Supabase Edge Functions — never from the frontend
- **Database:** Postgres via Supabase, with pgvector available for future use

---

## Core Principle: Service Layer Pattern

Vue components never call Supabase directly. All DB interactions go through a service function, and global state is held in Pinia stores that wrap those services.

```
Vue Component
  → Pinia store (global reactive state + action methods)
    → service (plain async function, no Vue)
      → Supabase
```

Components may also consume Pinia stores directly for reads (the store's computed props work like composables). Composables (`src/composables/`) remain as an option for component-local state that doesn't belong in a global store.

---

## Project Structure (current)

```
src/
  lib/
    supabase.js              ← single Supabase client instance

  services/                  ← all Supabase/API calls, nowhere else
    auth.js
    organizations.js
    memberships.js

  stores/                    ← Pinia stores for global state
    auth.js                  ← session, user, sign-in/out
    org.js                   ← memberships, currentOrg, isOnboarded

  composables/               ← per-component reusable state (sparingly used so far)
    useNewBriefModal.js

  views/
    Dashboard.vue            ← /briefs
    Knowledge.vue            ← /knowledge
    Users.vue                ← /users
    Settings.vue             ← /settings
    Microsite.vue            ← /m/:id? (prospect-facing, public)
    auth/
      Login.vue
      Signup.vue
      AuthCallback.vue       ← /auth/callback (OAuth return)
    onboarding/
      Onboarding.vue         ← /onboarding (hosts multi-step flow)

  components/
    AppShell.vue
    AppHeader.vue            ← avatar menu + sign out
    Sidebar.vue
    NewBriefModal.vue
    StatusPill.vue
    Sparkline.vue
    icons/                   ← single Icon.vue + an index of small SVG paths
    auth/                    ← SSOButton, TextField
    onboarding/              ← WorkspaceStep and future steps
    microsite/               ← Header, Greeting, Tabs, HeardTab, WhyTab, StickyCTA, Footer
    dashboard/               ← HeroCTA, StatsRow, OnboardingBanner, BriefsTable
    knowledge/               ← CollectionsRail, UploadRow, ArtifactsTable, FileKindBadge

  router/
    index.js                 ← all routes + single beforeEach guard

  data/                      ← static mock data for views not yet wired to DB

  main.js                    ← app bootstrap (awaits store inits before mount)
```

---

## Data Model Shape (multi-tenant)

- `public.users` — profile row per auth user. Auto-created via the `on_auth_user_created` trigger on `auth.users` insert.
- `public.organizations` — workspaces. No `owner_id` column; ownership lives on `memberships`.
- `public.memberships(org_id, user_id, role)` — the join table. Role is `owner | admin | member`. Composite PK prevents duplicate memberships. Unique partial index enforces exactly one owner per org.
- `public.workspaces`, `public.documents`, `public.calls`, `public.microsites`, `public.microsite_events` — app-domain tables, all keyed to `org_id`.

A user belongs to 0+ orgs. `isOnboarded` is derived from `memberships.length > 0`, not a flag.

See [docs/callbriefs-schema.sql](callbriefs-schema.sql) for the consolidated current schema, and [sql/](../sql/) for the migration history.

---

## Write Surface

Two patterns, picked per operation:

**SECURITY DEFINER RPC** — for:
- Multi-table atomic writes (e.g., `complete_onboarding` inserts an org, an owner membership, and a default Sales workspace in one transaction).
- Writes that need custom error messages (`raise exception 'Only owners...'`).
- Writes with validation logic that's awkward to express as a `WITH CHECK` predicate.

Target tables have **no INSERT grants** to `authenticated` — the RPC is the only write path. Today: `organizations`, `memberships`.

**INSERT policy + GRANT** — for:
- Single-table inserts where the authorization rule is expressible as a `WITH CHECK` predicate that reads memberships or other already-visible state.

Today: `workspaces`.

**Rule of thumb:** start with the policy approach. Promote to an RPC when you need multi-step atomicity, a friendly error message, or validation that doesn't fit cleanly in `WITH CHECK`.

---

## Permissions (UI-side RBAC)

Role → allowed-action mappings live in `src/lib/permissions.js`. A `useCan()` composable exposes `can('action')` that reads `org.currentRole` reactively — swapping orgs/workspaces updates every gated element automatically.

```js
// lib/permissions.js
const BY_ROLE = {
  owner: ['workspace.create', 'member.invite', 'org.settings', ...],
  admin: ['workspace.create', 'member.invite', ...],
  member: [],
}
export const can = (role, action) => !!role && (BY_ROLE[role] ?? []).includes(action)
```

```vue
<script setup>
import { useCan } from '@/composables/useCan'
const can = useCan()
</script>
<template>
  <button v-if="can('workspace.create')">Create</button>
</template>
```

**This is UI gating, not enforcement.** DB-side RLS policies and RPC role checks are the security boundary; the permissions map exists to hide buttons that would otherwise fail on click. When policy changes, update both places in the same PR.

**Current RPCs:**
- `complete_onboarding(p_org_name, p_org_domain)` — creates an org + owner membership + default Sales workspace atomically.

**Planned RPCs:**
- `accept_invite(p_token)` — creates a membership for the caller based on a pending invite.
- `is_member_of_org(p_org_id)` — SECURITY DEFINER helper for RLS policies that need to check membership without triggering recursion.

---

## Implementation Examples

### `src/lib/supabase.js`
One client instance, imported everywhere.

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

---

### `src/services/memberships.js`
Plain async — no Vue, no state.

```js
import { supabase } from '@/lib/supabase'

export const getMyMemberships = (userId) =>
  supabase
    .from('memberships')
    .select('role, created_at, organizations(id, name, domain, logo_url, brand_color)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
```

---

### `src/stores/org.js` (shape)
Pinia setup store. Owns reactive state + actions. Caches an `initPromise` so `init()` is idempotent and safe to `await` from the router guard.

```js
export const useOrgStore = defineStore('org', () => {
  const memberships = ref([])
  const currentOrgId = ref(null)
  const isOnboarded = computed(() => memberships.value.length > 0)

  const init = () => { /* cached promise, loads memberships once */ }
  const loadMemberships = async () => { /* fresh fetch */ }
  const completeOnboarding = async ({ orgName, orgDomain }) => { /* calls RPC + reloads */ }
  const switchOrg = (orgId) => { /* persists currentOrgId to localStorage */ }
  const reset = () => { /* cleared on SIGNED_OUT event */ }

  return { memberships, currentOrgId, isOnboarded, init, loadMemberships, completeOnboarding, switchOrg, reset }
})
```

---

### `src/router/index.js` — guard
The guard awaits both store inits before applying redirect rules. Don't skip these awaits — the router's first navigation fires during `app.use(router)`, before `app.mount()`, and the stores won't be populated synchronously.

```js
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.init()

  const org = useOrgStore()
  if (auth.isAuthed) await org.init()

  const isPublic = to.meta.public === true

  if (!auth.isAuthed && !isPublic) return '/login'
  if (auth.isAuthed && (to.name === 'login' || to.name === 'signup')) {
    return org.isOnboarded ? '/briefs' : '/onboarding'
  }
  if (auth.isAuthed && !org.isOnboarded && to.name !== 'onboarding' && !isPublic) {
    return '/onboarding'
  }
  if (auth.isAuthed && org.isOnboarded && to.name === 'onboarding') {
    return '/briefs'
  }
})
```

---

## Route Meta Conventions

- `meta: { layout: 'auth' | 'onboarding' | 'microsite' }` — bypass `AppShell`. `App.vue` checks `isBareLayout = !!route.meta?.layout`.
- `meta: { public: true }` — bypass the auth guard. Applies to `login`, `signup`, `auth-callback`, and the prospect-facing `microsite`.

Orthogonal — a route can have both (e.g., `signup`).

---

## Edge Functions (AI Layer)

AI calls will run as Supabase Edge Functions, not from the frontend. Planned:

```
supabase/
  functions/
    process-transcript/      ← extract problems from transcript via Claude
    generate-microsite/      ← map problems to doc extracts, generate content
    extract-document/        ← extract structured info from uploaded doc
```

Frontend invokes via `supabase.functions.invoke('fn-name', { body: {...} })`.

---

## Key Rules

1. **Never call Supabase directly from a Vue component** — go through a store (for global state) or a service (for one-off reads).
2. **One Supabase client** — instantiated only in `src/lib/supabase.js`.
3. **Services are plain JS** — no Vue reactivity, no state.
4. **Global state in Pinia, per-component state in composables.**
5. **Choose the right write pattern.** Single-table inserts with authorization expressible in `WITH CHECK` → INSERT policy + grant. Multi-table, custom errors, or complex validation → `SECURITY DEFINER` RPC. Start with the policy; promote to RPC when you need it.
6. **AI calls run in Edge Functions.** Never call the Anthropic API from the frontend.
7. **Public routes explicitly marked** with `meta: { public: true }`.
8. **`VITE_`-prefixed env vars only** for anything the frontend needs. Server-side secrets live in Edge Function config.

---

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Anthropic API key lives in Supabase Edge Function secrets only — never in the frontend.
