-- dreaming-whale.sql
-- Wires up the microsite generation pipeline:
--   * Adds 'failed' to calls.status check (mirrors documents pattern)
--   * Pins calls.created_by to auth.uid() via column DEFAULT
--   * INSERT policy + grant on calls (org members only, owner = caller)
--
-- Microsites get inserted by the edge function via service_role, so we
-- don't need an INSERT policy on microsites for authenticated.

begin;

-- =========================================================================
-- calls: add 'failed' status
-- =========================================================================
alter table calls drop constraint if exists calls_status_check;
alter table calls add constraint calls_status_check
  check (status in ('processing', 'ready', 'sent', 'failed'));


-- =========================================================================
-- calls: pin created_by to auth.uid() via DEFAULT (matches documents.uploaded_by)
-- =========================================================================
alter table calls alter column created_by set default auth.uid();


-- =========================================================================
-- calls: INSERT policy — any org member can create a call in a workspace
-- in their org. created_by must be the caller (DEFAULT sets it; the
-- WITH CHECK rejects spoofing).
-- =========================================================================
create policy "members can create calls"
  on calls for insert
  with check (
    created_by = auth.uid()
    and exists (
      select 1
        from workspaces w
        join memberships m on m.org_id = w.org_id
        where w.id = calls.workspace_id
          and w.org_id = calls.org_id
          and m.user_id = auth.uid()
    )
  );

grant insert on table public.calls to authenticated;

commit;
