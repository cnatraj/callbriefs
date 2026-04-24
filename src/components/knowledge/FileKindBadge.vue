<script setup>
import { computed } from 'vue'
import { KIND_META } from '@/data/artifacts'

const props = defineProps({
  kind: { type: String, required: true },
})

const meta = computed(() => KIND_META[props.kind] || KIND_META.doc)
</script>

<template>
  <div
    class="w-[34px] h-[34px] grid place-items-center rounded-sm shrink-0 mono font-semibold text-[10px]"
    :style="{
      background: `color-mix(in oklch, ${meta.tint} 14%, white 86%)`,
      color: meta.tint,
      border: `1px solid color-mix(in oklch, ${meta.tint} 30%, white 70%)`,
    }"
  >
    {{ meta.label }}
  </div>
</template>
