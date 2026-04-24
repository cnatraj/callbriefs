-- =====================================================================
-- Fix: memberships SELECT policy was self-referencing
-- =====================================================================
-- The previous policy did `org_id in (select org_id from memberships ...)`.
-- Postgres applies RLS to the subquery too, which re-triggers the same
-- policy, and the evaluation silently returns empty. Net effect:
-- SELECTs on memberships returned [] for the authenticated client
-- even though rows existed — breaking the onboarding-complete redirect
-- because the client thought the user had no memberships.
--
-- Fix: scope the policy directly to the user. You can see *your own*
-- memberships. Teammate visibility (seeing other members in the same
-- org) will be added later via a SECURITY DEFINER helper function when
-- the Users page needs it.
--
-- The organizations policy (which also has a subquery on memberships)
-- works fine once THIS policy is non-recursive, because its inner
-- subquery now resolves cleanly.
-- =====================================================================

begin;

drop policy if exists "members can view org memberships" on memberships;

create policy "users can view their own memberships"
  on memberships for select
  using (user_id = auth.uid());

commit;
