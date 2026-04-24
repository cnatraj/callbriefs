import { supabase } from '@/lib/supabase'

export const getWorkspacesForOrg = (orgId) =>
  supabase
    .from('workspaces')
    .select('id, name, type, created_at')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true })

export const createWorkspace = ({ orgId, name }) =>
  supabase
    .from('workspaces')
    .insert({ org_id: orgId, name: name.trim(), type: 'sales' })
    .select('id, org_id, name, type, created_at')
    .single()
