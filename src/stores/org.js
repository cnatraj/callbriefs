import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import * as membershipsService from '@/services/memberships'
import * as orgsService from '@/services/organizations'
import * as workspacesService from '@/services/workspaces'

const LS_KEY = 'cb.currentOrgId'
const LS_WORKSPACE_KEY = 'cb.currentWorkspaceId'
let initPromise = null
let subscribed = false

export const useOrgStore = defineStore('org', () => {
  const memberships = ref([])
  const currentOrgId = ref(null)
  const workspaces = ref([])
  const currentWorkspaceId = ref(null)
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
  const currentWorkspace = computed(
    () => workspaces.value.find((w) => w.id === currentWorkspaceId.value) ?? null,
  )

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

  const pickCurrentWorkspaceId = () => {
    const stored = localStorage.getItem(LS_WORKSPACE_KEY)
    const match = workspaces.value.find((w) => w.id === stored)
    currentWorkspaceId.value = match
      ? stored
      : (workspaces.value[0]?.id ?? null)
    if (currentWorkspaceId.value)
      localStorage.setItem(LS_WORKSPACE_KEY, currentWorkspaceId.value)
  }

  const loadWorkspaces = async (orgId) => {
    if (!orgId) {
      workspaces.value = []
      currentWorkspaceId.value = null
      return
    }
    const { data, error: err } =
      await workspacesService.getWorkspacesForOrg(orgId)
    if (err) {
      error.value = err.message
      workspaces.value = []
    } else {
      workspaces.value = data ?? []
      pickCurrentWorkspaceId()
    }
  }

  const loadMemberships = async () => {
    const auth = useAuthStore()
    if (!auth.isAuthed) {
      memberships.value = []
      currentOrgId.value = null
      workspaces.value = []
      currentWorkspaceId.value = null
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
    if (currentOrgId.value) await loadWorkspaces(currentOrgId.value)
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
    workspaces.value = []
    currentWorkspaceId.value = null
    localStorage.removeItem(LS_KEY)
    localStorage.removeItem(LS_WORKSPACE_KEY)
    initPromise = null
  }

  const switchOrg = async (orgId) => {
    if (!memberships.value.find((m) => m.organizations?.id === orgId)) return
    currentOrgId.value = orgId
    localStorage.setItem(LS_KEY, orgId)
    await loadWorkspaces(orgId)
  }

  const switchWorkspace = (workspaceId) => {
    if (!workspaces.value.find((w) => w.id === workspaceId)) return
    currentWorkspaceId.value = workspaceId
    localStorage.setItem(LS_WORKSPACE_KEY, workspaceId)
  }

  const createWorkspace = async ({ name }) => {
    const orgId = currentOrgId.value
    if (!orgId) {
      const err = new Error('No current organization')
      error.value = err.message
      return { error: err }
    }
    loading.value = true
    error.value = null
    const { data, error: err } = await workspacesService.createWorkspace({
      orgId,
      name,
    })
    if (err) {
      error.value = err.message
      loading.value = false
      return { error: err }
    }
    await loadWorkspaces(orgId)
    if (data?.id) switchWorkspace(data.id)
    loading.value = false
    return { data }
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
    workspaces,
    currentWorkspaceId,
    currentWorkspace,
    loading,
    error,
    isOnboarded,
    init,
    loadMemberships,
    loadWorkspaces,
    reset,
    switchOrg,
    switchWorkspace,
    createWorkspace,
    completeOnboarding,
  }
})
