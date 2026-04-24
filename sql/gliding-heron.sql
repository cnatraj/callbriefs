-- =====================================================================
-- Migration: narrow the documents bucket to PDF + images only
-- =====================================================================
-- Scope reduction now that the edge function only supports the file
-- types Claude can natively ingest (application/pdf + common images).
-- docx/pptx support would require server-side text extraction or PDF
-- conversion — deferred.
-- =====================================================================

begin;

update storage.buckets
set allowed_mime_types = array[
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif'
]
where id = 'documents';

commit;
