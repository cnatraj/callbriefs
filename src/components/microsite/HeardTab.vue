<script setup>
import SectionHeader from './SectionHeader.vue'
import { MICROSITE } from '@/data/microsite'
import { IconCheck } from '@/components/icons'
</script>

<template>
  <!-- 01 What we heard -->
  <section>
    <SectionHeader num="01" label="What we heard" />
    <div class="flex flex-col gap-[10px]">
      <div
        v-for="h in MICROSITE.heard"
        :key="h.mark"
        class="flex gap-3 p-[14px] border border-ink-150 rounded-[12px] bg-surface"
      >
        <div
          class="w-[26px] h-[26px] rounded-[8px] bg-nav-bg border border-ink-100 text-ink-700 grid place-items-center mono text-[11px] font-semibold shrink-0"
        >
          {{ h.mark }}
        </div>
        <div class="min-w-0">
          <div
            class="text-[14.5px] text-ink-900 leading-[1.5]"
            style="letter-spacing: -0.005em"
          >
            {{ h.quote }}
          </div>
          <div class="text-[11.5px] text-ink-500 mt-[6px]">{{ h.attrib }}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- 02 Solutions -->
  <section>
    <SectionHeader num="02" label="How we’d solve it" />
    <div class="flex flex-col">
      <div
        v-for="s in MICROSITE.solutions"
        :key="s.tag"
        class="py-4 border-t border-ink-100 flex flex-col gap-[10px]"
      >
        <div class="flex items-center gap-2 text-[11.5px] text-ink-500">
          <span
            class="mono text-[11px] text-ink-700 px-2 py-[2px] bg-nav-bg border border-ink-150 rounded-full"
          >
            {{ s.tag }}
          </span>
          <span class="text-ink-400">→</span>
          <span>GTR approach</span>
        </div>
        <div
          class="text-[15px] font-semibold text-ink-900 leading-[1.3]"
          style="letter-spacing: -0.015em"
        >
          {{ s.title }}
        </div>
        <p class="text-[13.5px] text-ink-500 leading-[1.55] m-0">
          {{ s.body }}
        </p>
      </div>
    </div>
  </section>

  <!-- 03 Metrics -->
  <section>
    <SectionHeader num="03" label="Projected impact · for Fieldstone" />
    <div class="flex flex-col gap-[10px]">
      <div
        v-for="m in MICROSITE.metrics"
        :key="m.label"
        class="flex items-center justify-between gap-[14px] p-[18px] border border-ink-150 rounded-[12px] bg-surface"
      >
        <div class="min-w-0">
          <div class="text-[12.5px] text-ink-500 mb-[2px]">{{ m.label }}</div>
          <div class="flex items-baseline gap-2">
            <span
              class="text-[30px] font-semibold text-ink-900 leading-none"
              style="letter-spacing: -0.03em"
            >
              {{ m.value }}
            </span>
            <span class="text-[13.5px] text-ink-500 font-medium">
              {{ m.unit }}
            </span>
          </div>
          <div class="mono text-[11px] text-ink-500 mt-[6px]">
            {{ m.source }}
          </div>
        </div>
        <div
          class="w-2 h-2 rounded-[2px] bg-accent shrink-0"
          style="box-shadow: inset 0 0 0 1px var(--accent-strong)"
        />
      </div>
    </div>
  </section>

  <!-- 04 Next steps -->
  <section>
    <SectionHeader num="04" label="Next steps" />
    <div class="flex flex-col">
      <div
        v-for="s in MICROSITE.nextSteps"
        :key="s.n"
        class="flex items-start gap-[14px] py-4 border-t border-ink-100"
      >
        <div
          class="w-[26px] h-[26px] rounded-full grid place-items-center mono text-[12px] font-semibold shrink-0 mt-[1px]"
          :class="{
            'bg-ink-900 text-bg': s.status === 'done',
            'bg-accent text-accent-ink': s.status === 'next',
            'bg-surface text-ink-700': s.status === 'todo',
          }"
          :style="
            s.status === 'done'
              ? 'border: 1px solid var(--ink-900);'
              : s.status === 'next'
                ? 'border: 1px solid var(--accent-strong);'
                : 'border: 1px solid var(--ink-200);'
          "
        >
          <IconCheck v-if="s.status === 'done'" :size="11" :sw="3.5" />
          <template v-else>{{ s.n }}</template>
        </div>
        <div class="min-w-0 flex-1">
          <div
            class="text-[14.5px] font-medium text-ink-900 leading-[1.4]"
          >
            {{ s.title }}
          </div>
          <div class="text-[12px] text-ink-500 leading-[1.4] mt-[6px]">
            {{ s.meta }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
