<script setup>
defineProps({
  badge: { type: String, default: null },
});
</script>

<template>
  <button
    type="button"
    class="relative w-full flex items-center justify-center gap-[10px] h-[46px] px-4 rounded-[10px] border border-ink-200 bg-surface hover:bg-ink-100 text-ink-900 font-medium cursor-pointer transition-colors"
  >
    <slot name="icon" />
    <span><slot /></span>
    <span
      v-if="badge"
      class="mono absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tracking-wider text-ink-500 px-[6px] py-[2px] rounded-xs border border-ink-150 bg-bg"
    >
      {{ badge }}
    </span>
  </button>
</template>
