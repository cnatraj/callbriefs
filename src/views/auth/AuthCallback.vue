<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrgStore } from '@/stores/org'

const router = useRouter()
const auth = useAuthStore()
const org = useOrgStore()

onMounted(async () => {
  await auth.refreshSession()
  if (!auth.isAuthed) {
    router.replace('/login?error=auth_failed')
    return
  }
  await org.loadMemberships()
  router.replace(org.isOnboarded ? '/briefs' : '/onboarding')
})
</script>

<template>
  <div
    class="min-h-screen grid place-items-center text-ink-500 text-[14px]"
    data-screen-label="AuthCallback"
  >
    Signing you in…
  </div>
</template>
