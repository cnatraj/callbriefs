import { supabase } from '@/lib/supabase'

export const getMyMemberships = (userId) =>
  supabase
    .from('memberships')
    .select('role, created_at, organizations(id, name, domain, logo_url, brand_color)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
