import { ref, computed } from 'vue'
import { useDocumentsStore } from '@/stores/documents'

// Module-level so the composable is a singleton — same pattern as
// useNewBriefModal / useCreateWorkspaceDrawer.
const activeId = ref(null)

export function useArtifactDrawer() {
  const documents = useDocumentsStore()

  const isOpen = computed(() => !!activeId.value)
  // Derive the doc from the store so status transitions (processing →
  // ready) reflect live in the drawer without passing the object through.
  const activeDoc = computed(
    () => documents.documents.find((d) => d.id === activeId.value) ?? null,
  )

  const open = (docId) => {
    activeId.value = docId
  }
  const close = () => {
    activeId.value = null
  }

  return { isOpen, activeDoc, open, close }
}
