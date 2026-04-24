<script setup>
import SectionHeader from './SectionHeader.vue'
import { MICROSITE } from '@/data/microsite'
import {
  IconBolt,
  IconLink,
  IconShield,
  IconUsers,
} from '@/components/icons'

const ICON_MAP = {
  bolt: IconBolt,
  link: IconLink,
  shield: IconShield,
  users: IconUsers,
}
</script>

<template>
  <!-- Pitch stat card -->
  <section>
    <div
      class="px-[22px] pt-[22px] pb-5 rounded-[14px] bg-surface border border-ink-150"
    >
      <div class="eyebrow" style="color: var(--accent-ink); opacity: 0.8">
        The headline, in one line
      </div>
      <div
        class="text-[44px] font-semibold text-ink-900 my-[6px] leading-none"
        style="letter-spacing: -0.03em"
      >
        {{ MICROSITE.pitch.statValue }} {{ MICROSITE.pitch.statLabel }}
      </div>
      <p class="text-[13.5px] text-ink-700 leading-[1.5] m-0">
        {{ MICROSITE.pitch.copy }}
      </p>
    </div>
  </section>

  <!-- 01 Differentiators -->
  <section>
    <SectionHeader num="01" label="What makes GTR different" />
    <div class="flex flex-col">
      <div
        v-for="d in MICROSITE.diffs"
        :key="d.title"
        class="flex items-start gap-[14px] py-4 border-t border-ink-100"
      >
        <div
          class="w-[34px] h-[34px] rounded-[9px] bg-nav-bg border border-ink-100 text-ink-700 grid place-items-center shrink-0"
        >
          <component :is="ICON_MAP[d.icon]" :size="16" />
        </div>
        <div class="min-w-0">
          <div
            class="text-[15px] font-semibold text-ink-900 leading-[1.3]"
            style="letter-spacing: -0.015em"
          >
            {{ d.title }}
          </div>
          <p class="text-[13.5px] text-ink-500 leading-[1.5] m-0 mt-1">
            {{ d.body }}
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- 02 Customer story -->
  <section>
    <SectionHeader num="02" label="A team like yours" />
    <div
      class="flex flex-col gap-[14px] p-[18px] rounded-[14px] bg-surface border border-ink-150"
    >
      <div class="flex items-center justify-between">
        <div
          class="flex items-center gap-2 font-semibold"
          style="letter-spacing: -0.015em"
        >
          <span class="w-5 h-5 rounded-[5px] bg-ink-900 inline-block" />
          {{ MICROSITE.customerStory.company }}
        </div>
        <span class="mono text-[11px] text-ink-500">CASE STUDY</span>
      </div>

      <p
        class="text-[14.5px] text-ink-900 leading-[1.5] m-0"
        style="letter-spacing: -0.005em"
      >
        {{ MICROSITE.customerStory.quote }}
      </p>

      <div class="flex items-center gap-[10px] text-[12.5px] text-ink-500">
        <div
          class="w-[26px] h-[26px] rounded-full bg-ink-100 border border-ink-150 text-ink-700 grid place-items-center text-[10px] font-semibold"
        >
          {{ MICROSITE.customerStory.attribInitials }}
        </div>
        <div>
          <div class="text-ink-900 font-medium text-[12.5px]">
            {{ MICROSITE.customerStory.attribName }}
          </div>
          <div>{{ MICROSITE.customerStory.attribRole }}</div>
        </div>
      </div>

      <div
        class="grid grid-cols-3 gap-3 pt-3 border-t border-ink-100"
      >
        <div v-for="k in MICROSITE.customerStory.kpis" :key="k.label">
          <div
            class="text-[18px] font-semibold text-ink-900"
            style="letter-spacing: -0.02em"
          >
            {{ k.value }}
          </div>
          <div class="text-[11px] text-ink-500 mt-[2px]">{{ k.label }}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- 03 Social proof logo grid -->
  <section>
    <SectionHeader num="03" label="Trusted by revenue teams at" />
    <div
      class="grid grid-cols-3 rounded-[12px] overflow-hidden border border-ink-100"
    >
      <div
        v-for="(name, i) in MICROSITE.socialProofLogos"
        :key="name"
        class="flex items-center justify-center px-[10px] py-4 bg-nav-bg text-[12.5px] font-semibold text-ink-500"
        :style="{
          letterSpacing: '-0.01em',
          borderRight:
            i % 3 === 2 ? 'none' : '1px solid var(--ink-100)',
          borderBottom: i >= 3 ? 'none' : '1px solid var(--ink-100)',
        }"
      >
        {{ name }}
      </div>
    </div>
  </section>
</template>
