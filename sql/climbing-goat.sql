-- =====================================================================
-- Migration: complete_onboarding also creates a default Sales workspace
-- =====================================================================
-- Extends the existing complete_onboarding RPC. The function signature
-- and return shape are unchanged, so no client-side code changes are
-- required — `await org.completeOnboarding({ orgName, orgDomain })`
-- continues to work as before.
--
-- What's added: one INSERT into public.workspaces after the membership
-- row is created, same transaction. Every org created via this function
-- now starts with a Sales workspace.
--
-- The grant from curious-badger.sql (execute on complete_onboarding to
-- authenticated) carries over since the signature is identical.
-- =====================================================================

begin;

create or replace function public.complete_onboarding(
  p_org_name   text,
  p_org_domain text default null
)
returns table (
  org_id uuid,
  role   text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_org_id  uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (select 1 from public.users where id = v_user_id) then
    raise exception 'User profile missing';
  end if;

  if p_org_name is null or length(trim(p_org_name)) = 0 then
    raise exception 'Organization name is required';
  end if;

  insert into public.organizations (name, domain)
  values (trim(p_org_name), nullif(trim(p_org_domain), ''))
  returning id into v_org_id;

  insert into public.memberships (org_id, user_id, role)
  values (v_org_id, v_user_id, 'owner');

  -- Default Sales workspace — every new org starts with one
  insert into public.workspaces (org_id, name, type)
  values (v_org_id, 'Sales', 'sales');

  return query select v_org_id, 'owner'::text;
end;
$$;

commit;
