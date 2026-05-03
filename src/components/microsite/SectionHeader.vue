<script setup>
defineProps({
  num: { type: String, required: true },
  label: { type: String, required: true },
});
</script>

<template>
  <div class="flex items-baseline gap-[10px] mb-[14px]">
    <span
      class="text-[15px] font-semibold text-ink-900"
      style="letter-spacing: -0.02em"
    >
      {{ label }}
    </span>
  </div>
</template>
