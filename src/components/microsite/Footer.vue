<script setup>
import { computed } from "vue";
import { MICROSITE } from "@/data/microsite";
import { IconShare } from "@/components/icons";
import { useMicrositeShare } from "@/composables/useMicrositeShare";

const props = defineProps({
  participants: { type: Object, default: null },
  slug: { type: String, default: null },
  orgName: { type: String, default: null },
});

const company = computed(() => props.participants?.prospect?.company ?? "");
const briefId = computed(() => props.slug ?? MICROSITE.briefId);
const eyebrow = computed(() =>
  props.orgName ? `Prepared by ${props.orgName} for` : "Prepared for",
);

const { shareMicrosite } = useMicrositeShare();
</script>

<template>
  <div
    class="px-6 pt-[22px] pb-7 border-t border-ink-100 bg-nav-bg flex flex-col gap-[10px] items-center text-center"
    data-section-name="footer"
  >
    <div class="eyebrow">{{ eyebrow }}</div>
    <div
      class="text-[17px] font-semibold text-ink-900"
      style="letter-spacing: -0.02em"
    >
      {{ company }}
    </div>
    <div class="mono text-[11.5px] text-ink-500">BRIEF · {{ briefId }}</div>
    <button
      type="button"
      data-tracking-event="cta_clicked"
      data-tracking-cta="share_footer"
      class="mt-[14px] inline-flex items-center gap-[8px] px-[16px] py-[10px] rounded-[10px] border border-dashed border-ink-200 text-[13.5px] text-ink-700 hover:text-ink-900 hover:border-ink-300 transition-colors cursor-pointer bg-transparent"
      @click="shareMicrosite"
    >
      <IconShare :size="14" />
      SHARE
    </button>
    <div
      class="mt-[10px] text-[11px] text-ink-400 inline-flex items-center gap-[6px]"
    >
      <span class="w-[5px] h-[5px] rounded-full bg-ink-300" />
      Delivered by CallBriefs
    </div>
  </div>
</template>
