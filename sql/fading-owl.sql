-- =====================================================================
-- Migration: allow owners + admins to delete documents
-- =====================================================================
-- DB side of document deletion. Storage side is already covered by
-- hopping-hare.sql's "owners and admins can delete documents" policy
-- on storage.objects.
--
-- A regular member who tries to delete will hit this RLS and get
-- rejected, so the UI gating (v-if="can('document.delete')") is
-- belt-and-suspenders, not the security boundary.
-- =====================================================================

begin;

create policy "owners and admins can delete documents"
  on public.documents for delete
  using (
    exists (
      select 1
        from public.workspaces w
        join public.memberships m on m.org_id = w.org_id
        where w.id = documents.workspace_id
          and m.user_id = auth.uid()
          and m.role in ('owner', 'admin')
    )
  );

grant delete on table public.documents to authenticated;

commit;
