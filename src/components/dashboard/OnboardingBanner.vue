<script setup>
import { computed } from "vue";
import { IconCheck, IconX, IconSparkle } from "@/components/icons";

const emit = defineEmits(["dismiss"]);

const steps = [
  { label: "Create account", done: true },
  { label: "Connect call source", done: true },
  { label: "Upload brand kit", done: false },
  { label: "Send first brief", done: false },
];

const doneCount = computed(() => steps.filter((s) => s.done).length);
</script>

<template>
  <section
    class="flex items-center gap-[18px] px-[18px] py-[14px] rounded-[12px] text-ink-900"
    style="
      background: color-mix(in oklch, var(--accent) 18%, var(--bg) 82%);
      border: 1px solid
        color-mix(in oklch, var(--accent) 45%, var(--ink-150) 55%);
    "
  >
    <div
      class="w-[42px] h-[42px] grid place-items-center rounded-[10px] bg-surface border border-ink-150 text-accent-ink"
    >
      <IconSparkle :size="18" :sw="2" />
    </div>

    <div class="min-w-0">
      <div class="font-semibold" style="letter-spacing: -0.01em">
        Finish setting up your workspace
      </div>
      <div class="text-[12.5px] text-ink-700 mt-[2px]">
        {{ doneCount }} of {{ steps.length }} complete · about 4 minutes left
      </div>
    </div>

    <div class="flex gap-[6px] ml-auto items-center">
      <div
        v-for="(s, i) in steps"
        :key="i"
        class="flex items-center gap-[6px] text-[12px] px-[10px] py-[5px] rounded-full"
        :class="
          s.done
            ? 'bg-surface border border-ink-150 text-ink-900'
            : 'text-ink-500'
        "
        :style="!s.done ? 'border: 1px solid transparent;' : ''"
      >
        <span
          v-if="s.done"
          class="w-[14px] h-[14px] rounded-full bg-ink-900 text-bg grid place-items-center"
        >
          <IconCheck :size="9" :sw="3" />
        </span>
        <span
          v-else
          class="w-[14px] h-[14px] rounded-full"
          style="border: 1.5px dashed var(--ink-300)"
        />
        <span>{{ s.label }}</span>
      </div>
      <button
        class="grid place-items-center w-[30px] h-[30px] rounded-sm ml-[6px] cursor-pointer text-ink-500 bg-transparent border-0"
        title="Dismiss"
        @click="emit('dismiss')"
      >
        <IconX :size="14" />
      </button>
    </div>
  </section>
</template>
