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

// Same shape, looked up by primary key. Used by the rep-side preview drawer
// where we already know the microsite id from the calls store.
export const getMicrositeById = (id) =>
  supabase
    .from('microsites')
    .select('id, slug, status, content, created_at, call_id, workspace_id, org_id')
    .eq('id', id)
    .maybeSingle()
