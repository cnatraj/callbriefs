<script setup>
import { MICROSITE } from '@/data/microsite'
</script>

<template>
  <div class="px-6 pt-[22px] pb-1">
    <div class="eyebrow mb-[10px]">{{ MICROSITE.greeting.eyebrow }}</div>
    <h1
      class="text-[26px] font-semibold text-ink-900 m-0"
      style="
        letter-spacing: -0.025em;
        line-height: 1.15;
        text-wrap: balance;
      "
    >
      {{ MICROSITE.greeting.title }}
    </h1>
    <p
      class="text-[14.5px] text-ink-500 leading-[1.5] mt-[10px] mb-0"
    >
      {{ MICROSITE.greeting.lede }}
    </p>

    <!-- Byline -->
    <div
      class="flex items-center gap-[10px] mt-4 px-3 py-[10px] rounded-[10px] bg-nav-bg border border-ink-100"
    >
      <div
        class="w-[30px] h-[30px] rounded-full bg-ink-900 text-bg grid place-items-center text-[11px] font-semibold shrink-0"
      >
        {{ MICROSITE.rep.initials }}
      </div>
      <div class="min-w-0">
        <div
          class="text-[13px] font-medium text-ink-900 truncate leading-[1.25]"
        >
          {{ MICROSITE.rep.name }} · {{ MICROSITE.rep.title }}
        </div>
        <div class="text-[11.5px] text-ink-500 truncate leading-[1.3] mt-[2px]">
          {{ MICROSITE.rep.email }} · {{ MICROSITE.rep.replyNote }}
        </div>
      </div>
    </div>
  </div>
</template>
