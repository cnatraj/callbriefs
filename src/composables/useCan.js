import { useOrgStore } from '@/stores/org'
import { can } from '@/lib/permissions'

// Returns a function; calling can('action') inside a template re-evaluates
// on each render, so it stays reactive to org.currentRole changes.
export function useCan() {
  const org = useOrgStore()
  return (action) => can(org.currentRole, action)
}
