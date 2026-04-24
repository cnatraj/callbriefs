<script setup>
defineProps({
  size: { type: [Number, String], default: 18 },
  sw: { type: [Number, String], default: 1.6 },
  fill: { type: String, default: 'none' },
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    :fill="fill"
    stroke="currentColor"
    :stroke-width="sw"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="shrink-0"
  >
    <slot />
  </svg>
</template>
