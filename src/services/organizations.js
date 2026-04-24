import { supabase } from '@/lib/supabase'

export const completeOnboarding = ({ orgName, orgDomain }) =>
  supabase.rpc('complete_onboarding', {
    p_org_name: orgName,
    p_org_domain: orgDomain || null,
  })
