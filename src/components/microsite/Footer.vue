<script setup>
import { computed } from "vue";
import { MICROSITE } from "@/data/microsite";

const props = defineProps({
  participants: { type: Object, default: null },
  slug: { type: String, default: null },
});

const company = computed(() => props.participants?.prospect?.company ?? "");
const briefId = computed(() => props.slug ?? MICROSITE.briefId);
</script>

<template>
  <div
    class="px-6 pt-[22px] pb-7 border-t border-ink-100 bg-nav-bg flex flex-col gap-[10px] items-center text-center"
  >
    <div class="eyebrow">Prepared for</div>
    <div
      class="text-[17px] font-semibold text-ink-900"
      style="letter-spacing: -0.02em"
    >
      {{ company }}
    </div>
    <div class="mono text-[11.5px] text-ink-500">BRIEF · {{ briefId }}</div>
    <div
      class="mt-[10px] text-[11px] text-ink-400 inline-flex items-center gap-[6px]"
    >
      <span class="w-[5px] h-[5px] rounded-full bg-ink-300" />
      Delivered by CallBriefs
    </div>
  </div>
</template>
