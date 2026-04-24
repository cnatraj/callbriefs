  -- =====================================================================
  -- Migration: create_workspace RPC
  -- =====================================================================
  -- Called from the client when a user submits the Create Workspace drawer.
  -- Inserts a workspace in the given org, validating the caller is an
  -- owner or admin of that org.
  --
  -- SECURITY DEFINER — the only write path to public.workspaces. The
  -- authenticated role has no INSERT grant, matching the pattern used for
  -- organizations and memberships.
  --
  -- Type is hardcoded to 'sales' for now — the UI doesn't collect type.
  -- When type selection lands, add p_type text default 'sales' to the
  -- signature and validate against the CHECK list.
  -- =====================================================================

  begin;

  create or replace function public.create_workspace(
    p_org_id uuid,
    p_name   text
  )
  returns table (
    id         uuid,
    org_id     uuid,
    name       text,
    type       text,
    created_at timestamp with time zone
  )
  language plpgsql
  security definer
  set search_path = public
  as $$
  declare
    v_user_id     uuid := auth.uid();
    v_caller_role text;
    v_new_id      uuid;
  begin
    if v_user_id is null then
      raise exception 'Not authenticated';
    end if;

    if p_org_id is null then
      raise exception 'Organization is required';
    end if;

    if p_name is null or length(trim(p_name)) = 0 then
      raise exception 'Workspace name is required';
    end if;

    select m.role
      into v_caller_role
      from public.memberships m
      where m.user_id = v_user_id
        and m.org_id = p_org_id;

    if v_caller_role is null then
      raise exception 'Not a member of this organization';
    end if;

    if v_caller_role not in ('owner', 'admin') then
      raise exception 'Only owners and admins can create workspaces';
    end if;

    insert into public.workspaces (org_id, name, type)
    values (p_org_id, trim(p_name), 'sales')
    returning workspaces.id into v_new_id;

    return query
      select w.id, w.org_id, w.name, w.type, w.created_at
        from public.workspaces w
        where w.id = v_new_id;
  end;
  $$;

  grant execute on function public.create_workspace(uuid, text) to authenticated;

  commit;
