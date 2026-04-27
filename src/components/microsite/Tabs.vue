<script setup>
const props = defineProps({ modelValue: { type: String, required: true } })
const emit = defineEmits(['update:modelValue'])

const TABS = [
  { key: 'heard', label: 'What we heard', target: 'what_we_heard' },
  { key: 'why', label: 'Why GTR', target: 'why_us' },
]
</script>

<template>
  <div
    class="sticky top-0 z-[5] px-5 pt-[18px] pb-3"
    style="
      background: linear-gradient(
        to bottom,
        var(--surface) 78%,
        color-mix(in oklch, var(--surface) 92%, transparent 8%) 100%
      );
    "
  >
    <div
      class="grid grid-cols-2 p-[3px] bg-nav-bg border border-ink-100 rounded-[10px]"
      role="tablist"
    >
      <button
        v-for="t in TABS"
        :key="t.key"
        role="tab"
        :aria-selected="props.modelValue === t.key"
        data-tracking-event="cta_clicked"
        data-tracking-cta="tab"
        :data-tracking-target="t.target"
        class="py-[9px] px-[10px] text-[13.5px] text-center rounded-[7px] cursor-pointer border-0 transition-colors"
        :class="
          props.modelValue === t.key
            ? 'font-semibold text-ink-900'
            : 'font-medium text-ink-500 bg-transparent'
        "
        :style="
          props.modelValue === t.key
            ? 'letter-spacing: -0.01em; background: var(--surface); box-shadow: 0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px var(--ink-150);'
            : 'letter-spacing: -0.01em;'
        "
        @click="emit('update:modelValue', t.key)"
      >
        {{ t.label }}
      </button>
    </div>
  </div>
</template>
