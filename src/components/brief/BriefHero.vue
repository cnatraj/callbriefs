<script setup>
import {
  IconClock,
  IconMail,
  IconEye,
  IconLink,
  IconArrowUpRight,
} from "@/components/icons";

defineProps({
  title: { type: String, default: "Brief" },
  // Static placeholders; wire to microsites.sent_at / channel later.
  canPreview: { type: Boolean, default: true },
  canShare: { type: Boolean, default: true },
});

defineEmits(["preview", "copy-link", "open-as-prospect"]);
</script>

<template>
  <div class="flex items-center gap-[16px]">
    <h1
      class="flex-1 min-w-0 text-[22px] font-semibold text-ink-900 truncate"
      style="letter-spacing: -0.025em"
    >
      {{ title }}
    </h1>

    <div
      class="flex items-center gap-[12px] shrink-0 text-[12.5px] text-ink-500"
    >
      <button
        type="button"
        :disabled="!canPreview"
        class="inline-flex items-center gap-[6px] px-[12px] py-[8px] rounded-[8px] border border-ink-150 bg-surface text-ink-900 font-medium cursor-pointer hover:bg-ink-100 transition-colors disabled:cursor-not-allowed disabled:text-ink-400"
        @click="$emit('preview')"
      >
        <IconEye :size="13" />
        Preview microsite
      </button>

      <button
        type="button"
        :disabled="!canShare"
        class="inline-flex items-center gap-[6px] px-[12px] py-[8px] rounded-[8px] border border-ink-150 bg-surface text-ink-900 font-medium cursor-pointer hover:bg-ink-100 transition-colors disabled:cursor-not-allowed disabled:text-ink-400"
        @click="$emit('copy-link')"
      >
        <IconLink :size="13" />
        Copy link to microsite
      </button>

      <button
        type="button"
        :disabled="!canShare"
        class="inline-flex items-center gap-[6px] px-[12px] py-[8px] rounded-[8px] border font-medium transition-colors"
        :class="
          canShare
            ? 'bg-ink-900 text-bg border-ink-900 cursor-pointer'
            : 'bg-ink-100 text-ink-400 border-ink-150 cursor-not-allowed'
        "
        @click="$emit('open-as-prospect')"
      >
        Open as prospect
        <IconArrowUpRight :size="13" :sw="2" />
      </button>
    </div>
  </div>
</template>
