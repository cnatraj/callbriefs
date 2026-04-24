<script setup>
import { MICROSITE } from '@/data/microsite'
</script>

<template>
  <!-- Meta strip -->
  <div
    class="flex items-center justify-between gap-[10px] px-5 pt-[14px] eyebrow"
    style="white-space: nowrap"
  >
    <span class="flex items-center gap-[6px]">
      <span class="w-[6px] h-[6px] rounded-full bg-accent-strong inline-block" />
      {{ MICROSITE.preparedOn }}
    </span>
    <span class="mono text-[10.5px] normal-case tracking-normal">
      {{ MICROSITE.readMinutes }} min read
    </span>
  </div>

  <!-- Dual-logo -->
  <div
    class="flex items-center gap-[14px] px-5 pt-[14px] pb-[22px] border-b border-ink-100"
  >
    <div class="flex-1 min-w-0 flex flex-col items-center gap-2">
      <span class="eyebrow">From</span>
      <div class="flex items-center gap-2">
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="var(--ink-900)" />
          <path
            d="M10 20V12h6.5a3 3 0 0 1 0 6H13"
            stroke="white"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />
          <path
            d="M16 18l4 4"
            stroke="white"
            stroke-width="2.2"
            stroke-linecap="round"
          />
        </svg>
        <span
          class="font-semibold text-[15px] text-ink-900"
          style="letter-spacing: -0.02em"
        >
          {{ MICROSITE.sender.name }}
        </span>
      </div>
    </div>

    <div
      class="w-7 h-7 rounded-full grid place-items-center text-ink-400 bg-bg border border-ink-150 shrink-0 text-[13px]"
    >
      ×
    </div>

    <div class="flex-1 min-w-0 flex flex-col items-center gap-2">
      <span class="eyebrow">For</span>
      <div class="flex items-center gap-2">
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
          <rect
            x="1"
            y="1"
            width="30"
            height="30"
            rx="8"
            fill="none"
            stroke="var(--ink-900)"
            stroke-width="1.5"
          />
          <path d="M9 22 L16 10 L23 22 Z" fill="var(--ink-900)" />
          <circle cx="22" cy="11" r="2" fill="var(--accent-strong)" />
        </svg>
        <span
          class="font-semibold text-[15px] text-ink-900"
          style="letter-spacing: -0.02em"
        >
          {{ MICROSITE.prospect.name }}
        </span>
      </div>
    </div>
  </div>
</template>
