<script setup>
import { STATS } from "@/data/briefs";
import Sparkline from "@/components/Sparkline.vue";
import { IconSend, IconTrendUp, IconClock } from "@/components/icons";

const ICONS = { sent: IconSend, month: IconTrendUp, time: IconClock };
</script>

<template>
  <section class="grid grid-cols-3 gap-[14px]">
    <div
      v-for="s in STATS"
      :key="s.key"
      class="relative flex flex-col gap-2 bg-surface border border-ink-150 rounded-[12px] px-[18px] py-4"
      style="min-height: 128px"
    >
      <div class="flex items-center gap-[6px] text-[12px] text-ink-500">
        <component :is="ICONS[s.key]" :size="12" class="text-ink-400" />
        {{ s.label }}
      </div>
      <div
        class="text-[30px] font-semibold text-ink-900"
        style="letter-spacing: -0.025em"
      >
        {{ s.value }}
      </div>
      <div
        class="inline-flex items-center gap-1 rounded-full text-[12px] font-medium w-fit px-[7px] py-[2px]"
        :class="s.trend === 'up' ? 'text-ok' : 'text-ink-700 bg-ink-100'"
        :style="
          s.trend === 'up'
            ? 'background: color-mix(in oklch, var(--ok) 14%, white 86%);'
            : ''
        "
      >
        <span class="text-[10px]">{{ s.trend === "up" ? "▲" : "▼" }}</span>
        {{ s.delta }}
      </div>
      <Sparkline
        :trend="s.trend"
        :color="s.trend === 'up' ? 'var(--ok)' : 'var(--ink-700)'"
      />
    </div>
  </section>
</template>
