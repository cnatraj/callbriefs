<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
  pct: { type: [Number, String], default: null },
})

const STATUS_MAP = {
  sent: {
    label: 'Sent',
    dot: 'var(--ink-900)',
    bg: 'var(--ink-100)',
    ink: 'var(--ink-900)',
  },
  viewed: {
    label: 'Viewed',
    dot: 'var(--ok)',
    bg: 'color-mix(in oklch, var(--ok) 12%, white 88%)',
    ink: 'color-mix(in oklch, var(--ok) 70%, black 30%)',
  },
  draft: {
    label: 'Draft',
    dot: 'var(--ink-400)',
    bg: 'var(--ink-100)',
    ink: 'var(--ink-700)',
  },
  processing: {
    label: 'Processing',
    dot: 'var(--accent-strong)',
    bg: 'color-mix(in oklch, var(--accent) 18%, white 82%)',
    ink: 'var(--accent-ink)',
  },
  indexed: {
    label: 'Indexed',
    dot: 'var(--ok)',
    bg: 'color-mix(in oklch, var(--ok) 12%, white 88%)',
    ink: 'color-mix(in oklch, var(--ok) 70%, black 30%)',
  },
  'needs-review': {
    label: 'Needs review',
    dot: 'var(--warn)',
    bg: 'color-mix(in oklch, var(--warn) 18%, white 82%)',
    ink: 'color-mix(in oklch, var(--warn) 60%, black 40%)',
  },
}

const meta = computed(() => STATUS_MAP[props.status] || STATUS_MAP.draft)
const isProcessing = computed(() => props.status === 'processing')
</script>

<template>
  <span
    class="inline-flex items-center gap-[7px] rounded-full text-[12px] font-medium"
    :style="{ padding: '3px 9px 3px 8px', background: meta.bg, color: meta.ink }"
  >
    <span
      v-if="isProcessing"
      class="rounded-full"
      :style="{
        width: '7px',
        height: '7px',
        background: meta.dot,
        boxShadow: `0 0 0 3px color-mix(in oklch, ${meta.dot} 25%, transparent)`,
      }"
    />
    <span
      v-else
      class="rounded-full"
      :style="{ width: '6px', height: '6px', background: meta.dot }"
    />
    {{ meta.label }}
    <span v-if="isProcessing && pct != null" class="mono text-[11px] opacity-75">
      {{ pct }}%
    </span>
  </span>
</template>
