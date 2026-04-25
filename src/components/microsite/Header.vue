<script setup>
import { computed } from "vue";
import { MICROSITE } from "@/data/microsite";

const props = defineProps({
  content: { type: Object, default: null },
  createdAt: { type: String, default: null },
});

const preparedOn = computed(() => {
  if (!props.createdAt) return MICROSITE.preparedOn;
  const d = new Date(props.createdAt);
  if (isNaN(d.getTime())) return MICROSITE.preparedOn;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
});

const fromName = computed(
  () => props.content?.org?.name ?? MICROSITE.sender.name,
);
const forName = computed(
  () =>
    props.content?.participants?.prospect?.company ?? MICROSITE.prospect.name,
);
</script>

<template>
  <!-- Meta strip -->
  <div
    class="flex items-center justify-between gap-[10px] px-5 pt-[14px] eyebrow"
    style="white-space: nowrap"
  >
    <span class="flex items-center gap-[6px]">
      <span
        class="w-[6px] h-[6px] rounded-full bg-accent-strong inline-block"
      />
      {{ preparedOn }}
    </span>
    <span class="mono text-[10.5px] normal-case tracking-normal">
      7 min read
    </span>
  </div>

  <!-- Dual-logo -->
  <div
    class="flex items-center gap-[14px] px-5 pt-[14px] pb-[22px] border-b border-ink-100"
  >
    <div class="flex-1 min-w-0 flex flex-col items-center gap-1">
      <span class="eyebrow">From</span>
      <div class="flex items-center gap-2">
        <span
          class="font-semibold text-[15px] text-ink-900"
          style="letter-spacing: -0.02em"
        >
          {{ fromName }}
        </span>
      </div>
    </div>

    <div
      class="w-7 h-7 rounded-full grid place-items-center text-ink-400 bg-bg border border-ink-150 shrink-0 text-[13px]"
    >
      <>
    </div>

    <div class="flex-1 min-w-0 flex flex-col items-center gap-1">
      <span class="eyebrow">For</span>
      <div class="flex items-center gap-2">
        <span
          class="font-semibold text-[15px] text-ink-900"
          style="letter-spacing: -0.02em"
        >
          {{ forName }}
        </span>
      </div>
    </div>
  </div>
</template>
