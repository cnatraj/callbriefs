-- =====================================================================
-- Migration: allow teammates to see each other's profile rows
-- =====================================================================
-- Previously the only SELECT policy on public.users was
--   using (id = auth.uid())
-- which meant anyone querying `documents` joined with `uploaded_by`
-- would see null for rows they didn't upload themselves. Blocks showing
-- uploader names in the artifact table/drawer, and similar patterns for
-- members, authors, assignees, etc.
--
-- Fix: a SECURITY DEFINER helper that checks "do I share at least one
-- org with this user?", then an additional SELECT policy that uses it.
-- The existing "users can view own record" policy stays — it covers
-- the bootstrap case where a freshly-signed-up user has no memberships
-- yet (shares_org_with would return false in that state).
-- =====================================================================

begin;

-- ----------------------------------------------------------------
-- Helper: caller shares at least one org with p_user_id
-- ----------------------------------------------------------------
-- SECURITY DEFINER runs as the function owner (postgres), which has
-- BYPASSRLS — important because the memberships SELECT policy itself
-- restricts to the caller's own memberships, and we need to read both
-- sides of the relationship here.
create or replace function public.shares_org_with(p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
      from public.memberships m1
      join public.memberships m2 on m1.org_id = m2.org_id
      where m1.user_id = auth.uid()
        and m2.user_id = p_user_id
  );
$$;

grant execute on function public.shares_org_with(uuid) to authenticated;


-- ----------------------------------------------------------------
-- New users SELECT policy: teammates are visible
-- ----------------------------------------------------------------
-- Additive to "users can view own record" — policies are OR'd, so
-- either passing lets the row through. Keep both so a user with no
-- memberships (pre-onboarding) can still read their own profile.
drop policy if exists "users can view teammates" on public.users;

create policy "users can view teammates"
  on public.users for select
  using (shares_org_with(id));

commit;
