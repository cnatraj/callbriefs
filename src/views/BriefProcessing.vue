<script setup>
import {
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useRouter } from "vue-router";
import { IconSparkle, IconCheck, IconArrowRight } from "@/components/icons";

const router = useRouter();

const brief = {
  title: "Fieldstone Labs — Q2 follow-up",
  context: "Discovery call • Ava Chen ↔ Jess Patel",
  callMin: 32,
  words: 4218,
  turns: 147,
  micrositeId: "B-2040",
};

const stages = [
  {
    title: "Parsing transcript",
    sub: "Diarizing speakers, cleaning timestamps",
  },
  {
    title: "Extracting pain points",
    sub: "Scanning for needs, objections, success criteria",
  },
  {
    title: "Mapping to your docs",
    sub: "Finding matching case studies & security artifacts",
  },
  {
    title: "Drafting sections",
    sub: "Hero, answers, social proof, pricing, next steps",
  },
  {
    title: "Personalizing & packaging",
    sub: "Matching voice, assembling links, generating share URL",
  },
];

const STAGE_MS = 3600;
const TOTAL_MS = STAGE_MS * stages.length;
const TOTAL_SEC = Math.round(TOTAL_MS / 1000);

const elapsed = ref(0);
let intervalId = null;
let startedAt = 0;

onMounted(() => {
  startedAt = performance.now();
  intervalId = setInterval(() => {
    elapsed.value = Math.min(TOTAL_MS, performance.now() - startedAt);
    if (elapsed.value >= TOTAL_MS) clearInterval(intervalId);
  }, 100);
});
onBeforeUnmount(() => clearInterval(intervalId));

const activeIndex = computed(() =>
  Math.min(stages.length, Math.floor(elapsed.value / STAGE_MS)),
);
const isComplete = computed(() => activeIndex.value >= stages.length);
const percent = computed(() =>
  Math.min(100, Math.floor((elapsed.value / TOTAL_MS) * 100)),
);
const remainingSec = computed(() =>
  Math.max(0, TOTAL_SEC - Math.floor(elapsed.value / 1000)),
);
const fmtTime = (s) => `0:${String(s).padStart(2, "0")}`;

const stageState = (i) => {
  if (i < activeIndex.value) return "done";
  if (i === activeIndex.value && !isComplete.value) return "active";
  return "pending";
};

const openMicrosite = () => {
  if (!isComplete.value) return;
  router.push(`/m/${brief.micrositeId}`);
};
const goBriefs = () => router.push("/briefs");

// Floating active-row highlight — measures the active li and slides between rows
const liRefs = ref([]);
const setLiRef = (el, i) => {
  if (el) liRefs.value[i] = el;
};
const highlight = ref({ top: 0, height: 0, visible: false });

const updateHighlight = () => {
  if (isComplete.value) {
    highlight.value = { ...highlight.value, visible: false };
    return;
  }
  const el = liRefs.value[activeIndex.value];
  if (!el) return;
  highlight.value = {
    top: el.offsetTop,
    height: el.offsetHeight,
    visible: true,
  };
};

watch([activeIndex, isComplete], () => nextTick(updateHighlight), {
  immediate: true,
});

const onResize = () => updateHighlight();
onMounted(() => {
  nextTick(updateHighlight);
  window.addEventListener("resize", onResize);
});
onBeforeUnmount(() => window.removeEventListener("resize", onResize));
</script>

<template>
  <div
    class="min-h-screen flex flex-col bg-bg"
    data-screen-label="BriefProcessing"
  >
    <!-- Top bar -->
    <header class="bg-surface border-b border-ink-150">
      <div class="h-14 px-[28px] flex items-center gap-3">
        <!-- Breadcrumb -->
        <div class="flex items-center gap-2 text-[13px] min-w-0">
          <button
            type="button"
            class="text-ink-500 bg-transparent border-0 cursor-pointer p-0"
            @click="goBriefs"
          >
            CallBriefs
          </button>
          <span class="text-ink-300">/</span>
          <button
            type="button"
            class="text-ink-500 bg-transparent border-0 cursor-pointer p-0"
            @click="goBriefs"
          >
            Briefs
          </button>
          <span class="text-ink-300">/</span>
          <span class="text-ink-900 font-medium truncate">{{
            brief.title
          }}</span>
        </div>

        <!-- Open microsite CTA -->
        <button
          type="button"
          :disabled="!isComplete"
          class="ml-auto inline-flex items-center gap-2 px-[18px] py-[10px] rounded-[10px] font-semibold border transition-colors"
          :class="
            isComplete
              ? 'bg-accent hover:bg-accent-strong text-accent-ink border-accent-strong shadow-cta cursor-pointer'
              : 'bg-ink-100 text-ink-400 border-ink-150 cursor-not-allowed'
          "
          @click="openMicrosite"
        >
          Open microsite
          <IconArrowRight :size="14" :sw="2" />
        </button>
      </div>
      <!-- Citron stripe -->
      <div class="h-[3px] bg-accent" />
    </header>

    <!-- Content -->
    <main class="flex-1 px-[28px] pt-[56px] pb-[80px]">
      <div class="max-w-[640px] mx-auto flex flex-col gap-[40px]">
        <!-- Brief card -->
        <section
          class="bg-surface border border-ink-150 rounded-[14px] p-[28px]"
        >
          <div class="flex items-center gap-[6px] eyebrow text-ink-500">
            <IconSparkle :size="12" :sw="2" />
            New Brief
          </div>

          <h1
            class="mt-[14px] text-[28px] font-semibold text-ink-900"
            style="letter-spacing: -0.025em; line-height: 1.15"
          >
            {{ brief.title }}
          </h1>

          <div class="mt-[8px] text-ink-500">
            {{ brief.context }}
          </div>

          <div
            class="mt-[22px] flex flex-wrap gap-x-[28px] gap-y-2 text-ink-500"
          >
            <div>
              <span class="text-ink-900 font-semibold"
                >{{ brief.callMin }}m</span
              >
              <span class="ml-[6px]">call</span>
            </div>
            <div>
              <span class="text-ink-900 font-semibold mono">{{
                brief.words.toLocaleString()
              }}</span>
              <span class="ml-[6px]">words</span>
            </div>
            <div>
              <span class="text-ink-900 font-semibold mono">{{
                brief.turns
              }}</span>
              <span class="ml-[6px]">turns</span>
            </div>
          </div>
        </section>

        <!-- Pipeline -->
        <section>
          <div class="flex items-center justify-between">
            <div class="eyebrow">Pipeline</div>
            <div class="text-ink-500 text-[12.5px]">
              <template v-if="isComplete">
                completed in
                <span class="mono text-ink-900">{{ fmtTime(TOTAL_SEC) }}</span>
              </template>
              <template v-else>
                <span class="mono text-ink-900">{{ percent }}%</span>
                <span class="mx-[6px] text-ink-300">·</span>
                <span class="mono"
                  >≈ {{ fmtTime(remainingSec) }} remaining</span
                >
              </template>
            </div>
          </div>

          <ol class="relative mt-[22px] flex flex-col gap-[6px] isolate">
            <!-- Floating active highlight -->
            <div
              class="absolute rounded-[12px] bg-accent-tint pointer-events-none z-0"
              style="
                left: -10px;
                right: -10px;
                top: 0;
                transition:
                  transform 480ms cubic-bezier(0.22, 1, 0.36, 1),
                  height 480ms cubic-bezier(0.22, 1, 0.36, 1),
                  opacity 240ms ease;
                will-change: transform, height;
              "
              :style="{
                transform: `translateY(${highlight.top}px)`,
                height: `${highlight.height}px`,
                opacity: highlight.visible ? 1 : 0,
              }"
            />
            <li
              v-for="(stage, i) in stages"
              :key="stage.title"
              :ref="(el) => setLiRef(el, i)"
              class="relative z-10 flex items-start gap-[14px] rounded-[12px] px-[10px] py-[10px] -mx-[10px]"
            >
              <!-- Indicator -->
              <span class="shrink-0 mt-[1px] grid place-items-center">
                <!-- DONE -->
                <span
                  v-if="stageState(i) === 'done'"
                  class="w-[18px] h-[18px] rounded-full grid place-items-center bg-accent text-accent-ink border border-accent-strong"
                >
                  <IconCheck :size="11" :sw="2.4" />
                </span>

                <!-- ACTIVE: empty inner circle + rotating ring -->
                <span
                  v-else-if="stageState(i) === 'active'"
                  class="relative w-[23px] h-[23px] grid place-items-center"
                >
                  <span
                    class="w-[18px] h-[18px] rounded-full bg-surface border border-accent-strong"
                  />
                  <span
                    class="absolute inset-0 rounded-full border-[1.5px] border-transparent spinner-arc"
                  />
                </span>

                <!-- PENDING -->
                <span
                  v-else
                  class="w-[18px] h-[18px] rounded-full bg-surface border border-ink-300"
                />
              </span>

              <div class="flex-1 min-w-0">
                <div
                  class="text-[15px]"
                  style="letter-spacing: -0.01em"
                  :class="[
                    stageState(i) === 'active'
                      ? 'font-semibold'
                      : 'font-normal',
                    stageState(i) === 'pending'
                      ? 'text-ink-400'
                      : 'text-ink-900',
                  ]"
                >
                  {{ stage.title }}
                </div>
                <div
                  class="mt-[3px]"
                  :class="
                    stageState(i) === 'pending'
                      ? 'text-ink-300'
                      : 'text-ink-500'
                  "
                >
                  {{ stage.sub }}
                </div>
              </div>
            </li>
          </ol>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.bg-accent-tint {
  background: color-mix(in oklch, var(--accent) 28%, white 72%);
}

.spinner-arc {
  border-top-color: var(--accent-strong);
  animation: spinner-rotate 1s linear infinite;
}

@keyframes spinner-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
