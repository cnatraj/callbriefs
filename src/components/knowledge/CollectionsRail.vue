<script setup>
import { COLLECTIONS } from "@/data/artifacts";

const TAGS = [
  "pricing",
  "security",
  "case-study",
  "playbook",
  "integrations",
  "demo",
  "competition",
];
</script>

<template>
  <aside>
    <div class="eyebrow px-[10px] pt-1 pb-[6px]">Collections</div>

    <div
      v-for="(c, i) in COLLECTIONS"
      :key="i"
      class="flex items-center justify-between px-[10px] py-[7px] rounded-sm cursor-pointer"
      :class="
        c.active
          ? 'bg-ink-100 text-ink-900 font-medium'
          : 'text-ink-700 hover:bg-ink-100'
      "
    >
      <span>{{ c.name }}</span>
      <span class="mono text-[11px] text-ink-500">{{ c.count }}</span>
    </div>

    <div class="eyebrow px-[10px] pt-[18px] pb-[6px]">Tags</div>
    <div class="flex flex-wrap gap-[6px] px-[10px] py-1">
      <span
        v-for="t in TAGS"
        :key="t"
        class="mono text-[11px] px-[7px] py-[2px] rounded bg-ink-100 text-ink-700"
      >
        #{{ t }}
      </span>
    </div>
  </aside>
</template>
