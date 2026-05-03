<script setup>
import { computed } from "vue";
import SectionHeader from "./SectionHeader.vue";
import StrategicObjective from "./StrategicObjective.vue";
import ShareCard from "@/components/microsite/ShareCard.vue";
import Closer from "./Closer.vue";
import { MICROSITE } from "@/data/microsite";
import { IconCheck } from "@/components/icons";

const props = defineProps({
  content: { type: Object, default: null },
  createdAt: { type: String, default: null },
});

const pad2 = (i) => String(i + 1).padStart(2, "0");
const upper = (s) => (s ? s.toUpperCase() : "");

// Section 01 — pair each challenge with its matching solution by index.
// LLM contract emits parallel arrays, so challenges[i] ↔ solutions[i].
// Defensive: cap at min length so a mismatch doesn't render blank halves.
const items = computed(() => {
  const challenges = props.content?.challenges;
  const solutions = props.content?.solutions;
  if (challenges?.length) {
    const n = Math.min(
      challenges.length,
      solutions?.length ?? challenges.length,
    );
    return Array.from({ length: n }, (_, i) => ({
      mark: pad2(i),
      tag: upper(solutions?.[i]?.header),
      problem: challenges[i]?.challenge,
      solution: solutions?.[i]?.text,
    }));
  }
  // Demo /m/ fallback — pair MICROSITE mock arrays with the same shape.
  const mockH = MICROSITE.heard;
  const mockS = MICROSITE.solutions;
  const n = Math.min(mockH.length, mockS.length);
  return Array.from({ length: n }, (_, i) => ({
    mark: pad2(i),
    tag: upper(mockH[i]?.attrib),
    problem: mockH[i]?.quote,
    solution: mockS[i]?.body,
  }));
});

const toolsUsed = computed(() => props.content?.tools_used ?? []);

const company = computed(
  () => props.content?.participants?.prospect?.company ?? "Fieldstone",
);

// Section 03 — map content.projected_impact into the template's
// {label, value} shape.
const metrics = computed(() => {
  const list = props.content?.projected_impact;
  if (!list?.length) return MICROSITE.metrics;
  return list.map((m) => ({
    label: m.metric,
    value: m.number,
  }));
});

// Section 04 — map content.what_we_need_to_align_on into the template's
// {n, title, status, meta} shape. Always prepends the discovery call as
// a completed step at index 0; remaining items are 'todo'.
const formatCallDate = (val) => {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const nextSteps = computed(() => {
  const list = props.content?.what_we_need_to_align_on;
  if (!list?.length) return MICROSITE.nextSteps;
  const callDate = formatCallDate(props.content?.meta?.call_date);
  const items = [
    {
      title: "Our discovery + requirements call",
      status: "done",
      meta: callDate ? `Completed on ${callDate}` : "",
    },
    ...list.map((title) => ({ title, status: "todo", meta: "" })),
  ];
  return items.map((item, i) => ({
    n: pad2(i),
    title: item.title,
    status: item.status,
    meta: item.meta,
  }));
});
</script>

<template>
  <div data-section-name="what_we_heard" class="flex flex-col gap-7">
    <!-- Strategic objective -->
    <StrategicObjective :content="content?.strategic_objective" />

    <!-- 01 What we heard -->
    <section>
      <SectionHeader num="01" label="What we heard" />
      <div class="flex flex-col gap-[10px]">
        <div
          v-for="item in items"
          :key="item.mark"
          class="flex gap-3 p-[18px] border border-ink-150 rounded-[12px] bg-surface"
        >
          <div
            class="w-[26px] h-[26px] rounded-[8px] bg-nav-bg border border-ink-100 text-ink-700 grid place-items-center mono text-[11px] font-semibold shrink-0"
          >
            {{ item.mark }}
          </div>
          <div class="min-w-0 flex-1">
            <div v-if="item.tag" class="eyebrow mb-[10px]">
              {{ item.tag }}
            </div>
            <div
              class="text-[15px] text-ink-900 leading-[1.55]"
              style="letter-spacing: -0.005em"
            >
              {{ item.problem }}
            </div>
            <template v-if="item.solution">
              <div class="my-[16px] border-t border-ink-100" />
              <p class="text-[13.5px] text-ink-700 leading-[1.55] m-0">
                {{ item.solution }}
              </p>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- Tool stack -->
    <!-- <section v-if="toolsUsed.length">
    <div class="eyebrow mb-[10px]">Currently using</div>
    <div class="flex flex-wrap gap-[6px]">
      <span
        v-for="tool in toolsUsed"
        :key="tool"
        class="inline-flex items-center px-[10px] py-[5px] rounded-sm bg-nav-bg border border-ink-100 text-ink-700 text-[12.5px] font-medium"
      >
        {{ tool }}
      </span>
    </div>
  </section> -->

    <!-- 02 Metrics -->
    <section>
      <SectionHeader num="02" label="What our customers typically see." />
      <div class="flex flex-col gap-[10px]">
        <div
          v-for="m in metrics"
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

    <!-- Closer -->
    <Closer :content="content" :created-at="createdAt" />

    <!-- 03 Next steps -->
    <section>
      <SectionHeader num="03" label="Next steps" />
      <div class="flex flex-col">
        <div
          v-for="s in nextSteps"
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
            <div class="font-medium text-ink-900 leading-[1.4]">
              {{ s.title }}
            </div>
            <div
              v-if="s.meta"
              class="text-[12px] text-ink-500 leading-[1.4] mt-[6px]"
            >
              {{ s.meta }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <ShareCard :company="content?.participants?.prospect?.company" />
  </div>
</template>
