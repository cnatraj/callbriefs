import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import * as membershipsService from '@/services/memberships'
import * as orgsService from '@/services/organizations'

const LS_KEY = 'cb.currentOrgId'
let initPromise = null
let subscribed = false

export const useOrgStore = defineStore('org', () => {
  const memberships = ref([])
  const currentOrgId = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isOnboarded = computed(() => memberships.value.length > 0)

  const currentMembership = computed(
    () =>
      memberships.value.find(
        (m) => m.organizations?.id === currentOrgId.value,
      ) ?? null,
  )
  const currentOrg = computed(
    () => currentMembership.value?.organizations ?? null,
  )
  const currentRole = computed(() => currentMembership.value?.role ?? null)

  const pickCurrentOrgId = () => {
    const stored = localStorage.getItem(LS_KEY)
    const match = memberships.value.find(
      (m) => m.organizations?.id === stored,
    )
    currentOrgId.value = match
      ? stored
      : (memberships.value[0]?.organizations?.id ?? null)
    if (currentOrgId.value) localStorage.setItem(LS_KEY, currentOrgId.value)
  }

  const loadMemberships = async () => {
    const auth = useAuthStore()
    if (!auth.isAuthed) {
      memberships.value = []
      currentOrgId.value = null
      return
    }
    loading.value = true
    error.value = null
    const { data, error: err } = await membershipsService.getMyMemberships(
      auth.user.id,
    )
    if (err) {
      error.value = err.message
      memberships.value = []
    } else {
      memberships.value = data ?? []
      pickCurrentOrgId()
    }
    loading.value = false
  }

  const init = () => {
    if (initPromise) return initPromise
    initPromise = loadMemberships()
    return initPromise
  }

  const reset = () => {
    memberships.value = []
    currentOrgId.value = null
    localStorage.removeItem(LS_KEY)
    initPromise = null
  }

  const switchOrg = (orgId) => {
    if (!memberships.value.find((m) => m.organizations?.id === orgId)) return
    currentOrgId.value = orgId
    localStorage.setItem(LS_KEY, orgId)
  }

  const completeOnboarding = async ({ orgName, orgDomain }) => {
    loading.value = true
    error.value = null
    const { data, error: err } = await orgsService.completeOnboarding({
      orgName,
      orgDomain,
    })
    if (err) {
      error.value = err.message
      loading.value = false
      return { error: err }
    }
    await loadMemberships()
    if (data?.[0]?.org_id) switchOrg(data[0].org_id)
    loading.value = false
    return { data }
  }

  if (!subscribed) {
    subscribed = true
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') reset()
    })
  }

  return {
    memberships,
    currentOrgId,
    currentOrg,
    currentMembership,
    currentRole,
    loading,
    error,
    isOnboarded,
    init,
    loadMemberships,
    reset,
    switchOrg,
    completeOnboarding,
  }
})
