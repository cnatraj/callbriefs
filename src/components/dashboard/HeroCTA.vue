<script setup>
import {
  IconPlus,
  IconMic,
  IconDoc,
  IconClock,
  IconSparkle,
  IconArrowUpRight,
  IconMore,
} from "@/components/icons";
import { useNewBriefModal } from "@/composables/useNewBriefModal";

const { open } = useNewBriefModal();
</script>

<template>
  <section
    class="relative grid gap-6 p-[22px] rounded-[14px] bg-surface border border-ink-150 overflow-hidden"
    style="grid-template-columns: 1.1fr 1fr"
  >
    <!-- Left: copy -->
    <div>
      <span
        class="inline-flex items-center gap-[6px] text-[11px] font-medium uppercase text-ink-500 px-2 py-[3px] rounded-full border border-ink-150 bg-bg"
        style="letter-spacing: 0.08em"
      >
        <IconSparkle :size="11" :sw="2" class="text-accent-strong" />
        Start a new brief
      </span>

      <h2
        class="text-[28px] font-semibold leading-[1.15] text-ink-900 mt-[14px] mb-2"
        style="letter-spacing: -0.025em"
      >
        Turn your next call into a<br />personalized microsite.
      </h2>

      <p class="text-ink-500 leading-[1.5] max-w-[460px]">
        Drop in a transcript or recording. CallBriefs drafts a tailored page for
        your buyer — with their priorities, next steps, and the materials they
        asked for — in under seven minutes.
      </p>

      <div class="flex flex-wrap gap-[10px] mt-[18px]">
        <button
          class="inline-flex items-center gap-2 px-4 py-[10px] rounded-[9px] bg-accent hover:bg-accent-strong text-accent-ink border border-accent-strong font-semibold cursor-pointer shadow-cta-inset transition-colors"
          @click="open"
        >
          <IconPlus :size="15" :sw="2.2" />
          New Brief
          <span
            class="mono text-[11px] px-[5px] py-[1px] rounded-xs ml-1"
            style="
              opacity: 0.6;
              border: 1px solid
                color-mix(in oklch, var(--accent-ink) 25%, transparent);
            "
          >
            N
          </span>
        </button>
        <button
          class="inline-flex items-center gap-2 px-[14px] py-[10px] rounded-[9px] bg-surface text-ink-900 border border-ink-200 font-medium cursor-pointer"
        >
          <IconMic :size="14" />
          Record a call
        </button>
        <button
          class="inline-flex items-center gap-2 px-[14px] py-[10px] rounded-[9px] bg-surface text-ink-900 border border-ink-200 font-medium cursor-pointer"
        >
          <IconDoc :size="14" />
          From template
        </button>
      </div>

      <div
        class="flex items-center gap-[10px] mt-[14px] text-[12px] text-ink-500"
      >
        <IconClock :size="12" /> Avg. 6m 12s from transcript to sent brief
      </div>
    </div>

    <!-- Right: dropzone -->
    <div
      class="relative flex flex-col border border-ink-150 rounded-[10px] bg-bg px-4 py-[14px]"
      style="min-height: 220px"
    >
      <div class="flex items-center justify-between mb-3">
        <div class="text-[12px] font-medium text-ink-700">Quick import</div>
        <div class="mono text-[11px] text-ink-500">
          MP3 · M4A · WAV · VTT · TXT
        </div>
      </div>

      <div
        class="flex-1 flex flex-col items-center justify-center gap-[10px] text-center text-[13px] text-ink-500 rounded-[8px] p-[18px]"
        style="border: 1.5px dashed var(--ink-200)"
      >
        <div
          class="w-10 h-10 grid place-items-center rounded-[10px] border border-ink-200 bg-surface text-ink-700"
        >
          <IconArrowUpRight :size="18" />
        </div>
        <div>
          <div class="font-medium text-ink-900">
            Drop a transcript or recording
          </div>
          <div class="mt-1">or paste a meeting link · up to 500 MB</div>
        </div>
      </div>

      <div class="flex gap-2 mt-3">
        <div
          class="flex-1 flex items-center justify-center gap-[7px] px-[10px] py-[8px] rounded-sm border border-ink-150 bg-surface text-ink-700 text-[12.5px] cursor-pointer"
        >
          <span class="w-[14px] h-[14px] rounded-[3px] bg-ink-900" />
          Gong
        </div>
        <div
          class="flex-1 flex items-center justify-center gap-[7px] px-[10px] py-[8px] rounded-sm border border-ink-150 bg-surface text-ink-700 text-[12.5px] cursor-pointer"
        >
          <span class="w-[14px] h-[14px] rounded-[3px] bg-info" />
          Zoom
        </div>
        <div
          class="flex-1 flex items-center justify-center gap-[7px] px-[10px] py-[8px] rounded-sm border border-ink-150 bg-surface text-ink-700 text-[12.5px] cursor-pointer"
        >
          <span class="w-[14px] h-[14px] rounded-[3px] bg-ok" />
          Chorus
        </div>
        <div
          class="flex-1 flex items-center justify-center gap-[7px] px-[10px] py-[8px] rounded-sm border border-ink-150 bg-surface text-ink-700 text-[12.5px] cursor-pointer"
        >
          <IconMore :size="14" />
        </div>
      </div>
    </div>
  </section>
</template>
