<script setup>
import { computed } from 'vue'

const props = defineProps({
  trend: { type: String, default: 'up' },
  color: { type: String, default: null },
})

const up = computed(() => props.trend === 'up')
const stroke = computed(() => props.color || 'var(--ink-300)')
const dot = computed(() => props.color || 'var(--ink-700)')

const path = computed(() =>
  up.value
    ? 'M0 22 L10 18 L22 20 L36 12 L50 14 L66 8 L82 10 L100 3'
    : 'M0 6 L14 10 L28 8 L44 14 L60 12 L76 18 L90 16 L100 22',
)
</script>

<template>
  <svg
    width="104"
    height="28"
    viewBox="0 0 100 28"
    fill="none"
    class="absolute right-4 bottom-[14px] opacity-90"
  >
    <path
      :d="path"
      :stroke="stroke"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle cx="100" :cy="up ? 3 : 22" r="2.5" :fill="dot" />
  </svg>
</template>
