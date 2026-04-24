import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useOrgStore } from './org'
import * as documentsService from '@/services/documents'

let subscribed = false

export const useDocumentsStore = defineStore('documents', () => {
  const documents = ref([])
  const loading = ref(false)
  const error = ref(null)
  const loadedWorkspaceId = ref(null)

  const loadDocuments = async (workspaceId) => {
    if (!workspaceId) {
      documents.value = []
      loadedWorkspaceId.value = null
      return
    }
    loading.value = true
    error.value = null
    const { data, error: err } =
      await documentsService.getDocumentsForWorkspace(workspaceId)
    if (err) {
      error.value = err.message
      documents.value = []
    } else {
      documents.value = data ?? []
      loadedWorkspaceId.value = workspaceId
    }
    loading.value = false
  }

  const uploadDocument = async ({ file }) => {
    const org = useOrgStore()
    const orgId = org.currentOrgId
    const workspaceId = org.currentWorkspaceId

    if (!orgId || !workspaceId) {
      const err = new Error('No current workspace')
      error.value = err.message
      return { error: err }
    }

    loading.value = true
    error.value = null
    const { data, error: err } = await documentsService.uploadDocument({
      file,
      orgId,
      workspaceId,
    })
    if (err) {
      error.value = err.message
      loading.value = false
      return { error: err }
    }
    await loadDocuments(workspaceId)
    loading.value = false
    return { data }
  }

  const deleteDocument = async (doc) => {
    loading.value = true
    error.value = null
    const { error: err } = await documentsService.deleteDocument(
      doc.id,
      doc.file_url,
    )
    if (err) {
      error.value = err.message
      loading.value = false
      return { error: err }
    }
    documents.value = documents.value.filter((d) => d.id !== doc.id)
    loading.value = false
    return { error: null }
  }

  const openSignedUrl = async (doc) => {
    if (!doc?.file_url) return
    const { data, error: err } = await documentsService.getSignedUrl(
      doc.file_url,
      doc.name,
    )
    if (err) {
      error.value = err.message
      return
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  const reset = () => {
    documents.value = []
    loadedWorkspaceId.value = null
    error.value = null
  }

  if (!subscribed) {
    subscribed = true
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') reset()
    })
  }

  return {
    documents,
    loading,
    error,
    loadedWorkspaceId,
    loadDocuments,
    uploadDocument,
    deleteDocument,
    openSignedUrl,
    reset,
  }
})
