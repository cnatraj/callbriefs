import { ref } from 'vue'

const isOpen = ref(false)
const activeMicrositeId = ref(null)

export function usePreviewDrawer() {
  const open = (micrositeId) => {
    activeMicrositeId.value = micrositeId ?? null
    isOpen.value = true
  }
  const close = () => {
    isOpen.value = false
  }
  const toggle = () => {
    isOpen.value = !isOpen.value
  }
  return { isOpen, activeMicrositeId, open, close, toggle }
}
