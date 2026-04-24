-- =====================================================================
-- Migration: complete_onboarding RPC
-- =====================================================================
-- Creates an organization + owner membership for the authenticated user,
-- atomically. Called from the client once the onboarding form submits.
--
-- Inputs:
--   p_org_name   required, trimmed, non-empty
--   p_org_domain optional website/domain; empty strings coerced to null
--
-- Returns: one row { org_id uuid, role text } for the new owner membership.
--
-- Guards:
--   * Must be authenticated
--   * public.users row must exist (created by the on_auth_user_created
--     trigger from humming-sparrow.sql)
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

  return query select v_org_id, 'owner'::text;
end;
$$;

grant execute on function public.complete_onboarding(text, text) to authenticated;

commit;
