<script setup>
import { computed } from "vue";

const props = defineProps({
  content: { type: Object, default: null },
});

const statement = computed(() => props.content?.statement);
</script>

<template>
  <section
    v-if="statement"
    class="rounded-[14px] px-[20px] py-[20px]"
    style="
      background: color-mix(in oklch, var(--accent) 12%, white 88%);
      border: 1px solid color-mix(in oklch, var(--accent) 22%, white 78%);
      border-left: 4px solid var(--accent-strong);
    "
  >
    <div class="flex items-center gap-[8px] eyebrow text-ink-700 mb-[10px]">
      <span
        class="w-[6px] h-[6px] rounded-full bg-accent-strong inline-block"
      />
      Your strategic objective
    </div>
    <p
      class="text-[14.5px] text-ink-900 leading-[1.55] m-0"
      style="letter-spacing: -0.005em"
    >
      {{ statement }}
    </p>
  </section>
</template>
