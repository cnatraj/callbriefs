-- =====================================================================
-- Migration: documents — columns, write policy, storage bucket + RLS
-- =====================================================================
-- Stage 1 of the Knowledge upload feature. Everything backend-side.
-- After running, you can upload test files via the Supabase dashboard
-- into documents/{your_org_id}/{your_workspace_id}/ to verify the
-- storage RLS works.
--
-- Contents:
--   1. ALTER documents — add file_size + mime_type columns
--   2. INSERT policy + GRANT on documents (any org member can insert
--      into a workspace in their org — no role gate, per spec)
--   3. Create 'documents' storage bucket (private, 50 MB cap,
--      specific allowed MIME types)
--   4. Storage RLS on storage.objects:
--        INSERT + SELECT — org members of the path's org
--        DELETE          — owners + admins of the path's org
--
-- Path convention: {org_id}/{workspace_id}/{uuid}.{ext}
--   storage.foldername(name) returns [org_id, workspace_id] so
--   policies check the first path segment against memberships.
-- =====================================================================

begin;

-- ----------------------------------------------------------------
-- 1. Columns
-- ----------------------------------------------------------------
alter table public.documents
  add column if not exists file_size bigint;
alter table public.documents
  add column if not exists mime_type text;


-- ----------------------------------------------------------------
-- 2. INSERT policy + grant on documents
-- ----------------------------------------------------------------
drop policy if exists "members can add documents" on public.documents;

create policy "members can add documents"
  on public.documents for insert
  with check (
    exists (
      select 1
        from public.workspaces w
        join public.memberships m on m.org_id = w.org_id
        where w.id = documents.workspace_id
          and m.user_id = auth.uid()
    )
  );

grant insert on table public.documents to authenticated;


-- ----------------------------------------------------------------
-- 3. Storage bucket
-- ----------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  52428800,  -- 50 MB
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif'
  ]
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;


-- ----------------------------------------------------------------
-- 4. Storage RLS on storage.objects
-- ----------------------------------------------------------------
-- Upload: any org member can upload to their org's path
drop policy if exists "org members can upload documents" on storage.objects;
create policy "org members can upload documents"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1]::uuid in (
      select m.org_id
        from public.memberships m
        where m.user_id = auth.uid()
    )
  );

-- Read: any org member can read files in their org's path
drop policy if exists "org members can read documents" on storage.objects;
create policy "org members can read documents"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1]::uuid in (
      select m.org_id
        from public.memberships m
        where m.user_id = auth.uid()
    )
  );

-- Delete: only owners / admins of the path's org
drop policy if exists "owners and admins can delete documents" on storage.objects;
create policy "owners and admins can delete documents"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1]::uuid in (
      select m.org_id
        from public.memberships m
        where m.user_id = auth.uid()
          and m.role in ('owner', 'admin')
    )
  );

commit;
