<script setup>
import { computed, ref } from 'vue'
import { IconClock, IconCopy } from '@/components/icons'

const props = defineProps({
  slug: { type: String, default: null },
})

const publicUrl = computed(() => {
  if (!props.slug) return ''
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/m/${props.slug}`
})

const copied = ref(false)
let resetTimer = null

const handleCopy = async () => {
  if (!publicUrl.value) return
  try {
    await navigator.clipboard.writeText(publicUrl.value)
    copied.value = true
    if (resetTimer) clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch (err) {
    console.error('[story] clipboard write failed:', err)
  }
}
</script>

<template>
  <section class="flex flex-col gap-[20px]">
    <!-- Empty state — no events yet. Will become the session feed once
         event tracking lands. -->
    <div
      class="rounded-[14px] border border-ink-150 bg-surface px-[28px] py-[36px] text-center flex flex-col items-center gap-[14px]"
    >
      <span
        class="w-[44px] h-[44px] rounded-full grid place-items-center bg-ink-100 text-ink-500"
      >
        <IconClock :size="20" />
      </span>
      <div>
        <div
          class="text-[16px] font-semibold text-ink-900"
          style="letter-spacing: -0.01em"
        >
          Waiting for the first view
        </div>
        <div class="text-ink-500 text-[13.5px] mt-[4px] max-w-[420px]">
          Send the link to your prospect. Each session will appear here as
          a story — who looked, what they read, and how they engaged.
        </div>
      </div>

      <div
        v-if="publicUrl"
        class="mt-[6px] flex items-center gap-[6px] p-[6px] rounded-[10px] border border-ink-150 bg-bg w-full max-w-[460px]"
      >
        <div
          class="flex-1 min-w-0 px-[10px] mono text-[12.5px] text-ink-700 truncate text-left"
        >
          {{ publicUrl }}
        </div>
        <button
          type="button"
          class="shrink-0 inline-flex items-center gap-[6px] px-[12px] py-[8px] rounded-[8px] bg-ink-900 text-bg text-[12.5px] font-semibold cursor-pointer border-0 transition-colors"
          :style="copied ? 'background: var(--ok);' : ''"
          @click="handleCopy"
        >
          <IconCopy :size="13" />
          {{ copied ? 'Copied' : 'Copy link' }}
        </button>
      </div>
    </div>
  </section>
</template>
