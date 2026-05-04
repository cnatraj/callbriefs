<script setup>
import { computed } from "vue";
import {
  IconEye,
  IconRotateCcw,
  IconArrowDownToLine,
} from "@/components/icons";

const props = defineProps({
  prospectFirstName: { type: String, default: "Maya" },
});

const cards = computed(() => [
  {
    icon: IconEye,
    title: "First view",
    body: `We'll tell you when the link is first opened, what device they used, and which sections they actually read.`,
  },
  {
    icon: IconRotateCcw,
    title: "A second and subsequent visits",
    body: "Returning to a microsite is a buying signal. We'll surface it the moment it happens — that's the time to reach out.",
  },
  {
    icon: IconArrowDownToLine,
    title: "A forward",
    body: `If ${props.prospectFirstName} shares the link inside their company, we'll detect the new viewer and show you who, when, and what they read.`,
  },
]);
</script>

<template>
  <section class="flex flex-col gap-[14px]">
    <div class="flex items-baseline justify-between">
      <div class="eyebrow text-ink-500">What you'll see</div>
      <div class="mono text-[10.5px] text-ink-500">
        here's what we'll surface for you
      </div>
    </div>

    <div class="grid grid-cols-3 gap-[14px]">
      <div
        v-for="(card, i) in cards"
        :key="i"
        class="rounded-[12px] border border-dashed border-ink-200 bg-bg px-[20px] py-[20px] flex flex-col gap-[12px]"
      >
        <span
          class="w-[34px] h-[34px] rounded-[10px] grid place-items-center bg-ink-100 text-ink-500"
        >
          <component :is="card.icon" :size="16" />
        </span>
        <div class="text-ink-900 font-medium">{{ card.title }}</div>
        <div class="text-ink-500 text-[13px] leading-[1.55]">
          {{ card.body }}
        </div>
      </div>
    </div>
  </section>
</template>
