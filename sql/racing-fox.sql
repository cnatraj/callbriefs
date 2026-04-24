-- =====================================================================
-- Fix: grant authenticated role SELECT on memberships
-- =====================================================================
-- Error was 403 with Postgres code 42501 "permission denied for table
-- memberships". RLS policies are evaluated AFTER table-level grants,
-- so without an explicit grant the authenticated role can't SELECT
-- regardless of what policies say.
--
-- The older tables (organizations, users, etc.) already have grants
-- from the original schema script. The new memberships table, created
-- in wandering-otter.sql, didn't inherit them.
--
-- No INSERT/UPDATE/DELETE grants to authenticated — writes to
-- memberships only happen through SECURITY DEFINER functions
-- (complete_onboarding today; accept_invite later), which run as
-- the function owner and bypass GRANT/RLS for the write path.
-- =====================================================================

begin;

grant select on table public.memberships to authenticated;

commit;
