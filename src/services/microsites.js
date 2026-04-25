import { supabase } from '@/lib/supabase'

// Public read — `microsites` has a "public can view microsites" RLS policy
// + SELECT grant on anon, so prospects hitting /m/:slug don't need auth.
// Returns { data, error } where data is null when no row matches the slug.
export const getMicrositeBySlug = (slug) =>
  supabase
    .from('microsites')
    .select('id, slug, status, content, created_at, call_id, workspace_id, org_id')
    .eq('slug', slug)
    .maybeSingle()
