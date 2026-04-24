# CallBriefs — Code Architecture

## Tech Stack
- **Frontend:** Vue 3, Vue Router, Tailwind CSS
- **Backend:** Supabase (auth, database, storage, edge functions)
- **AI:** Anthropic API (Claude) via Supabase Edge Functions
- **Database:** PostgreSQL via Supabase, with pgvector available for future use

---

## Core Principle: Service Layer Pattern

Never call Supabase directly from Vue components. All database interactions go through a dedicated service layer. Components call composables, composables call services, services call Supabase.

```
Vue Component
  → composable (useXxx.js)
    → service (xxx.js)
      → Supabase
```

---

## Project Structure

```
src/
  lib/
    supabase.js          ← single Supabase client instance, imported everywhere

  services/              ← ALL Supabase/API calls live here, nowhere else
    organizations.js
    workspaces.js
    documents.js
    calls.js
    microsites.js
    events.js

  composables/           ← reusable state + logic, consumed by views/components
    useOrganization.js
    useWorkspaces.js
    useDocuments.js
    useCalls.js
    useMicrosites.js

  views/                 ← page-level components, mapped to routes
    auth/
      Login.vue
      Signup.vue
    dashboard/
      Dashboard.vue
    calls/
      CallsList.vue
      CallDetail.vue
      NewCall.vue
    microsites/
      MicrositePreview.vue
      MicrositePublic.vue  ← prospect-facing, no auth required
    settings/
      Settings.vue
      DocumentLibrary.vue

  components/            ← reusable UI components
    transcript/
      TranscriptInput.vue
    microsite/
      MicrositeCard.vue
      MicrositeSection.vue
    shared/
      AppHeader.vue
      LoadingSpinner.vue
      EmptyState.vue

  router/
    index.js             ← all routes defined here, auth guards applied

  stores/                ← Pinia stores for global state (auth, current org)
    auth.js
    organization.js
```

---

## Implementation Examples

### `src/lib/supabase.js`
One client instance, imported everywhere. Never instantiate the client elsewhere.

```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

---

### `src/services/calls.js`
All DB logic for calls. No Vue, no state — just data functions.

```js
import { supabase } from '@/lib/supabase'

export const getCalls = async (orgId) => {
  return await supabase
    .from('calls')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
}

export const getCallById = async (id) => {
  return await supabase
    .from('calls')
    .select('*')
    .eq('id', id)
    .single()
}

export const createCall = async (payload) => {
  return await supabase
    .from('calls')
    .insert(payload)
    .select()
    .single()
}

export const updateCall = async (id, updates) => {
  return await supabase
    .from('calls')
    .update(updates)
    .eq('id', id)
}
```

---

### `src/composables/useCalls.js`
State and logic for components. Wraps the service, exposes reactive state.

```js
import { ref } from 'vue'
import { getCalls, createCall } from '@/services/calls'

export const useCalls = () => {
  const calls = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchCalls = async (orgId) => {
    loading.value = true
    error.value = null
    const { data, error: err } = await getCalls(orgId)
    if (err) error.value = err.message
    else calls.value = data
    loading.value = false
  }

  const addCall = async (payload) => {
    const { data, error: err } = await createCall(payload)
    if (err) error.value = err.message
    else calls.value.unshift(data)
    return { data, error: err }
  }

  return { calls, loading, error, fetchCalls, addCall }
}
```

---

### `src/views/calls/CallsList.vue`
Clean component — no Supabase, no raw DB calls.

```vue
<script setup>
import { onMounted } from 'vue'
import { useCalls } from '@/composables/useCalls'
import { useOrganization } from '@/stores/organization'

const { calls, loading, fetchCalls } = useCalls()
const orgStore = useOrganization()

onMounted(() => fetchCalls(orgStore.currentOrg.id))
</script>

<template>
  <div>
    <LoadingSpinner v-if="loading" />
    <MicrositeCard v-for="call in calls" :key="call.id" :call="call" />
  </div>
</template>
```

---

### `src/router/index.js`
Auth guards applied here. Public routes (prospect-facing microsites) explicitly marked.

```js
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'

const routes = [
  { path: '/login', component: () => import('@/views/auth/Login.vue'), meta: { public: true } },
  { path: '/m/:slug', component: () => import('@/views/microsites/MicrositePublic.vue'), meta: { public: true } },
  { path: '/', component: () => import('@/views/dashboard/Dashboard.vue') },
  { path: '/calls', component: () => import('@/views/calls/CallsList.vue') },
  { path: '/calls/:id', component: () => import('@/views/calls/CallDetail.vue') },
  { path: '/settings', component: () => import('@/views/settings/Settings.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  if (to.meta.public) return true
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return '/login'
})

export default router
```

---

## Edge Functions (AI Layer)

AI calls (transcript processing, microsite generation, document extraction) run as Supabase Edge Functions — not from the frontend directly.

```
supabase/
  functions/
    process-transcript/
      index.ts       ← extracts problems from transcript via Claude
    generate-microsite/
      index.ts       ← maps problems to doc extracts, generates content
    extract-document/
      index.ts       ← extracts key info from uploaded doc, stores as JSON
```

Frontend calls edge functions via the Supabase client:

```js
const { data } = await supabase.functions.invoke('generate-microsite', {
  body: { callId }
})
```

---

## Key Rules

1. **Never call Supabase from a Vue component directly** — always go through a service
2. **One Supabase client** — only ever instantiated in `src/lib/supabase.js`
3. **Services are plain JS functions** — no Vue reactivity, no state, just async functions that return data
4. **Composables own state** — reactive refs live in composables, not components
5. **AI calls go through Edge Functions** — never call the Anthropic API from the frontend
6. **Public routes explicitly marked** — anything prospect-facing must have `meta: { public: true }`
7. **Environment variables prefixed with VITE_** — required for Vite to expose them to the frontend

---

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Anthropic API key lives in Supabase Edge Function secrets only — never in the frontend.
