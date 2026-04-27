import { supabase } from '@/lib/supabase'

export const createCall = ({ orgId, workspaceId, transcript }) =>
  supabase
    .from('calls')
    .insert({
      org_id: orgId,
      workspace_id: workspaceId,
      transcript,
    })
    .select('id, status, created_at')
    .single()

// Joined read used by the processing page. Microsite row may not exist yet
// while status is 'processing'; the related array will be empty until the
// edge function inserts it.
export const getCallWithMicrosite = (callId) =>
  supabase
    .from('calls')
    .select(
      'id, org_id, workspace_id, transcript, status, created_at, microsites(id, slug, content, status, overall_narrative)',
    )
    .eq('id', callId)
    .single()

// Dashboard list. Embeds the microsite (if generated) for company-name
// fallback, plus the rep via the created_by FK to users.
export const getCallsForWorkspace = (workspaceId) =>
  supabase
    .from('calls')
    .select(
      'id, status, created_at, prospect_name, prospect_company, prospect_email, created_by, microsites(id, slug, content), rep:created_by(id, name, email)',
    )
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

// Direct invoke of the edge function — used for the retry path. The
// function reuses the same call row (per product decision) and either
// inserts or updates the microsite row.
export const retryGenerate = (callId) =>
  supabase.functions.invoke('generate-microsite', { body: { callId } })
