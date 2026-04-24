-- =====================================================================
-- Migration: lock uploaded_by to auth.uid() on documents inserts
-- =====================================================================
-- Two complementary changes so the client can't spoof uploaded_by:
--
--   1. Column default: DEFAULT auth.uid() — if the client omits the
--      field entirely, it gets auto-filled to the caller's user id.
--   2. INSERT policy WITH CHECK: uploaded_by = auth.uid() — if the
--      client explicitly passes a value, it must be their own uid
--      (anything else, including NULL, is rejected).
--
-- Belt + suspenders: the default covers the happy path (legit client
-- omits the field), the policy check blocks spoofing attempts.
-- =====================================================================

begin;

-- 1. Default uploaded_by to the authenticated caller
alter table public.documents
  alter column uploaded_by set default auth.uid();

-- 2. Replace the INSERT policy
drop policy if exists "members can add documents" on public.documents;

create policy "members can add documents"
  on public.documents for insert
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1
        from public.workspaces w
        join public.memberships m on m.org_id = w.org_id
        where w.id = documents.workspace_id
          and m.user_id = auth.uid()
    )
  );

commit;
