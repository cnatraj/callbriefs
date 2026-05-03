<script setup>
import { computed } from "vue";
import SectionHeader from "./SectionHeader.vue";
import { MICROSITE } from "@/data/microsite";
import {
  IconBolt,
  IconLink,
  IconShield,
  IconUsers,
  IconZap,
  IconTimer,
  IconRocket,
  IconBadgeCheck,
  IconStar,
  IconSparkles,
  IconSliders,
  IconMousePointerClick,
  IconHeadphones,
  IconHandshake,
  IconBarChart2,
  IconBrain,
  IconPlug,
  IconGlobe,
  IconLayers,
} from "@/components/icons";

const ICON_MAP = {
  // LLM-output names (from prompt's allowed icon list)
  IconZap,
  IconTimer,
  IconRocket,
  IconBadgeCheck,
  IconStar,
  IconSparkles,
  IconSliders,
  IconMousePointerClick,
  IconHeadphones,
  IconHandshake,
  IconBarChart2,
  IconBrain,
  IconPlug,
  IconGlobe,
  IconLayers,
  // Legacy keys used by MICROSITE.diffs fallback (demo route)
  bolt: IconBolt,
  link: IconLink,
  shield: IconShield,
  users: IconUsers,
};

const resolveIcon = (name) => ICON_MAP[name] ?? IconStar;

const props = defineProps({
  content: { type: Object, default: null },
});

const title = computed(
  () => props.content?.why_us?.title ?? "The headline, in one line",
);
const summary = computed(
  () => props.content?.why_us?.summary ?? MICROSITE.pitch.copy,
);
// const company = computed(() => props.content?.org?.name ?? "us");
const company = "us";

const differentiators = computed(() => {
  const list = props.content?.core_differentiators;
  if (!list?.length) return MICROSITE.diffs;
  return list.map((d) => ({
    icon: d.icon,
    title: d.title,
    body: d.text,
  }));
});

// Map content.testimonials[0] into the existing customer-story card shape.
// Initials derived from the attribution name. Falls back to mock for demo.
const computeInitials = (name) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
};

const customerStory = computed(() => {
  const t = props.content?.testimonials?.[0];
  if (!t) return MICROSITE.customerStory;
  return {
    company: t.company,
    quote: t.quote,
    attribName: t.attribution?.name ?? "",
    attribRole: t.attribution?.title ?? "",
    attribInitials: computeInitials(t.attribution?.name),
  };
});

// trusted_by: show 6 if we have ≥6, else 3 if we have ≥3, else hide.
// Demo route falls back to MICROSITE.socialProofLogos (6 items).
const trustedBy = computed(() => {
  const list = props.content?.trusted_by;
  if (!list?.length) return MICROSITE.socialProofLogos;
  if (list.length >= 6) return list.slice(0, 6);
  if (list.length >= 3) return list.slice(0, 3);
  return [];
});
const trustedByLastRow = computed(
  () => Math.ceil(trustedBy.value.length / 3) - 1,
);
</script>

<template>
  <div data-section-name="why_us" class="flex flex-col gap-7">
  <!-- Pitch stat card -->
  <section>
    <div
      class="px-[22px] pt-[22px] pb-5 rounded-[14px] bg-surface border border-ink-150"
    >
      <div
        class="eyebrow mb-[10px]"
        style="color: var(--accent-ink); opacity: 0.8"
      >
        {{ title }}
      </div>

      <p class="text-ink-700 leading-[1.5] m-0">
        {{ summary }}
      </p>
    </div>
  </section>

  <!-- 01 Differentiators -->
  <section>
    <SectionHeader num="01" :label="`What makes ${company} different`" />
    <div class="flex flex-col">
      <div
        v-for="d in differentiators"
        :key="d.title"
        class="flex items-start gap-[14px] py-4 border-t border-ink-100"
      >
        <div
          class="w-[34px] h-[34px] rounded-[9px] bg-nav-bg border border-ink-100 text-ink-700 grid place-items-center shrink-0"
        >
          <component :is="resolveIcon(d.icon)" :size="16" />
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
          {{ customerStory.company }}
        </div>
        <span class="mono text-[11px] text-ink-500">TESTIMONIAL</span>
      </div>

      <div class="text-[36px] text-accent leading-[1.5] -mb-8 mono">“</div>
      <p
        class="text-[16px] text-ink-900 leading-[1.5] m-0 font-medium"
        style="letter-spacing: -0.005em"
      >
        {{ customerStory.quote }}"
      </p>

      <div class="flex items-center gap-[10px] text-[12.5px] text-ink-500">
        <div
          class="w-[26px] h-[26px] rounded-full bg-ink-100 border border-ink-150 text-ink-700 grid place-items-center text-[10px] font-semibold"
        >
          {{ customerStory.attribInitials }}
        </div>
        <div>
          <div class="text-ink-900 font-medium text-[12.5px]">
            {{ customerStory.attribName }}
          </div>
          <div>{{ customerStory.attribRole }} {{ customerStory.company }}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- 03 Social proof logo grid -->
  <section v-if="trustedBy.length">
    <SectionHeader num="03" label="Trusted by revenue teams at" />
    <div
      class="grid grid-cols-3 rounded-[12px] overflow-hidden border border-ink-100"
    >
      <div
        v-for="(name, i) in trustedBy"
        :key="name"
        class="flex items-center justify-center px-[10px] py-4 bg-nav-bg text-[12.5px] font-semibold text-ink-500"
        :style="{
          letterSpacing: '-0.01em',
          borderRight: i % 3 === 2 ? 'none' : '1px solid var(--ink-100)',
          borderBottom:
            Math.floor(i / 3) === trustedByLastRow
              ? 'none'
              : '1px solid var(--ink-100)',
        }"
      >
        {{ name }}
      </div>
    </div>
  </section>

  </div>
</template>
