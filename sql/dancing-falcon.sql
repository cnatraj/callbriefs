-- =====================================================================
-- Migration: replace create_workspace RPC with an INSERT policy
-- =====================================================================
-- Previous approach (roaming-lynx.sql) used a SECURITY DEFINER RPC.
-- Workspace creation is a single-table insert with a simple auth rule,
-- which is a better fit for the standard "grant + INSERT policy"
-- pattern. Smaller moving parts, more canonical Supabase.
--
-- Keeping for the RPC pattern: multi-table atomic writes
-- (complete_onboarding, future accept_invite) and anything that needs
-- custom error messages.
-- =====================================================================

begin;

-- Drop the RPC
drop function if exists public.create_workspace(uuid, text);

-- Allow owners and admins to insert workspaces for their org
create policy "owners and admins can create workspaces"
  on workspaces for insert
  with check (
    exists (
      select 1
        from memberships m
        where m.user_id = auth.uid()
          and m.org_id = workspaces.org_id
          and m.role in ('owner', 'admin')
    )
  );

-- Grant INSERT to authenticated. The policy above still restricts who
-- can actually write.
grant insert on table public.workspaces to authenticated;

commit;
