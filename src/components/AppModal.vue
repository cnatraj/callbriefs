<script setup>
import { watch, onBeforeUnmount, useSlots } from 'vue'
import { IconX } from './icons'

const props = defineProps({
  open: { type: Boolean, default: false },
  width: { type: String, default: '640px' },
  dismissible: { type: Boolean, default: true },
  showClose: { type: Boolean, default: true },
})

const emit = defineEmits(['close'])
const slots = useSlots()

const onKey = (e) => {
  if (e.key === 'Escape' && props.open && props.dismissible) emit('close')
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKey)
    } else {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})

const onBackdrop = () => {
  if (props.dismissible) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(20, 20, 20, 0.35)"
        @click.self="onBackdrop"
      >
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-[0.98]"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-[0.98]"
          appear
        >
          <div
            v-if="open"
            role="dialog"
            aria-modal="true"
            class="relative w-full bg-surface border border-ink-150 rounded-[16px] overflow-hidden shadow-panel"
            :style="{ maxWidth: width }"
          >
            <button
              v-if="showClose && dismissible"
              type="button"
              class="absolute top-4 right-4 w-8 h-8 grid place-items-center rounded-[8px] border border-ink-150 bg-surface text-ink-700 hover:bg-ink-100 cursor-pointer transition-colors z-10"
              aria-label="Close"
              @click="emit('close')"
            >
              <IconX :size="14" />
            </button>

            <header
              v-if="slots.header"
              class="px-6 pt-6 pb-5 pr-16 border-b border-ink-150"
            >
              <slot name="header" />
            </header>

            <div class="p-6">
              <slot />
            </div>

            <footer
              v-if="slots.footer"
              class="px-6 py-4 border-t border-ink-150"
            >
              <slot name="footer" />
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
