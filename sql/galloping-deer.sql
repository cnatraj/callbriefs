-- =====================================================================
-- Fix: grant table privileges for authenticated + anon roles
-- =====================================================================
-- Same 42501 error as racing-fox.sql, but on organizations this time.
-- Root cause: none of the public tables had explicit table-level grants.
-- Rather than patch per-table as each new query 403s, grant across
-- the whole public schema in one pass.
--
-- RLS still gates what each role can actually see — grants only open
-- the door for the policy engine to run.
--
-- Roles:
--   authenticated  — a logged-in user; needs SELECT on most tables
--                    (writes flow through SECURITY DEFINER RPCs, so
--                    no write grants here)
--   anon           — unauthenticated visitor; needs SELECT on
--                    microsites (public-by-slug) and INSERT on
--                    microsite_events (prospect tracking pixels)
-- =====================================================================

begin;

-- Schema usage (should already be set; idempotent)
grant usage on schema public to anon, authenticated;


-- SELECT on all current tables for authenticated.
-- RLS policies already exist to restrict which rows are visible.
grant select on table public.organizations     to authenticated;
grant select on table public.users             to authenticated;
grant select on table public.memberships       to authenticated;
grant select on table public.workspaces        to authenticated;
grant select on table public.documents         to authenticated;
grant select on table public.calls             to authenticated;
grant select on table public.microsites        to authenticated;
grant select on table public.microsite_events  to authenticated;

-- Let authenticated update their own users row
-- (the RLS policy "users can update own record" already filters by auth.uid())
grant update on table public.users to authenticated;


-- Public access for prospect-facing microsites
grant select on table public.microsites        to anon;
grant insert on table public.microsite_events  to anon;


-- Default privileges: anything we create in public going forward
-- automatically grants SELECT to authenticated. This prevents the
-- "create new table, forget grant, hit 42501" loop.
-- (Targeted at the postgres role, which is what the SQL editor runs as.)
alter default privileges in schema public
  grant select on tables to authenticated;

commit;
