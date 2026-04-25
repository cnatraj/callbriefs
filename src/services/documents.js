import { supabase } from '@/lib/supabase'

export const ALLOWED_MIMES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]

export const MAX_BYTES = 50 * 1024 * 1024 // 50 MB

const MIME_TO_EXT = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

const extForFile = (file) => {
  const dot = file.name.lastIndexOf('.')
  const fromName = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : null
  return fromName || MIME_TO_EXT[file.type] || 'bin'
}

// Count of `ready` docs in a workspace — used as a preflight gate
// before generating a microsite (we block generation when the workspace
// has no usable knowledge yet).
export const getReadyDocumentCount = async (workspaceId) => {
  const { count, error } = await supabase
    .from('documents')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('status', 'ready')
  return { count: count ?? 0, error }
}

export const getDocumentsForWorkspace = (workspaceId) =>
  supabase
    .from('documents')
    .select(
      'id, workspace_id, name, file_url, mime_type, file_size, type, status, uploaded_by, extracted_content, created_at, uploader:uploaded_by(id, name, email)',
    )
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

// Short-lived signed URL for reading/downloading a stored document.
// Pass `download: filename` to force a download with that filename via
// Content-Disposition; omit it to open the file inline in the browser
// (PDFs and images render in a new tab).
export const getSignedUrl = (filePath, { download } = {}) =>
  supabase.storage
    .from('documents')
    .createSignedUrl(filePath, 60, download ? { download } : undefined)

// Upload: put the file in storage under {org_id}/{workspace_id}/{uuid}.{ext},
// then insert a documents row. On DB failure, best-effort delete the
// orphaned storage object.
export const uploadDocument = async ({ file, orgId, workspaceId }) => {
  const id = crypto.randomUUID()
  const ext = extForFile(file)
  const filePath = `${orgId}/${workspaceId}/${id}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadErr) return { data: null, error: uploadErr }

  // uploaded_by is set server-side via the column DEFAULT auth.uid().
  // status defaults to 'uploaded' — the indexing pipeline transitions
  // it to 'processing' → 'ready' (or 'failed').
  const { data, error: insertErr } = await supabase
    .from('documents')
    .insert({
      id,
      workspace_id: workspaceId,
      name: file.name,
      file_url: filePath,
      mime_type: file.type,
      file_size: file.size,
    })
    .select()
    .single()

  if (insertErr) {
    await supabase.storage
      .from('documents')
      .remove([filePath])
      .catch(() => {})
    return { data: null, error: insertErr }
  }

  return { data, error: null }
}

// Delete DB row first (the source of truth the UI reads), then best-
// effort remove the storage object. Reversed order would risk showing
// a list row whose file is already gone.
export const deleteDocument = async (documentId, filePath) => {
  const { error: dbErr } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
  if (dbErr) return { error: dbErr }

  if (filePath) {
    await supabase.storage
      .from('documents')
      .remove([filePath])
      .catch(() => {})
  }
  return { error: null }
}
