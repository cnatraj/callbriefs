<script setup>
import {
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from 'vue'
import { useRouter } from 'vue-router'
import { useCallsStore } from '@/stores/calls'
import {
  IconSparkle,
  IconCheck,
  IconArrowRight,
  IconX,
} from '@/components/icons'

const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()
const calls = useCallsStore()

// ---------- Stage definitions (decorative — animation only) ----------------
const stages = [
  {
    title: 'Parsing transcript',
    sub: 'Diarizing speakers, cleaning timestamps',
  },
  {
    title: 'Extracting pain points',
    sub: 'Scanning for needs, objections, success criteria',
  },
  {
    title: 'Mapping to your docs',
    sub: 'Finding matching case studies & security artifacts',
  },
  {
    title: 'Drafting sections',
    sub: 'Hero, answers, social proof, pricing, next steps',
  },
  {
    title: 'Personalizing & packaging',
    sub: 'Matching voice, assembling links, generating share URL',
  },
]

const stageDurations = stages.map(() => 8000 + Math.random() * 4000)
const cumulative = stageDurations.reduce((acc, d, i) => {
  acc.push((acc[i - 1] ?? 0) + d)
  return acc
}, [])

// ---------- Real-status state -------------------------------------------
const startedAt = ref(performance.now())
const elapsed = ref(0)
let intervalId = null

const startTimer = () => {
  if (intervalId) return
  intervalId = setInterval(() => {
    elapsed.value = performance.now() - startedAt.value
  }, 100)
}
const stopTimer = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// On initial mount, redirect to Detail if status is already ready.
// (User typed/refreshed the URL — they shouldn't see the pipeline for a
// brief that's already done.) After mount we let polling update content
// in place — the "View brief" button takes over for the user-driven hop.
onMounted(async () => {
  await calls.loadCall(props.id)
  if (calls.activeCall?.status === 'ready') {
    router.replace(`/briefs/${props.id}`)
  }
})
onBeforeUnmount(() => {
  stopTimer()
  calls.reset()
})

// Re-load if route param changes (in-app nav between briefs)
watch(
  () => props.id,
  (next) => {
    if (next) {
      startedAt.value = performance.now()
      elapsed.value = 0
      calls.loadCall(next)
    }
  },
)

const status = computed(() => calls.activeCall?.status ?? null)
const isComplete = computed(() => status.value === 'ready')
const isFailed = computed(() => status.value === 'failed')
const isProcessing = computed(() => status.value === 'processing')
const isMissing = computed(
  () => !calls.loading && !calls.activeCall && !!calls.loadedCallId,
)

// Drive the elapsed timer off real status: run only while processing.
watch(
  isProcessing,
  (running) => {
    if (running) startTimer()
    else stopTimer()
  },
  { immediate: true },
)

const animatedIndex = computed(() => {
  for (let i = 0; i < stages.length; i++) {
    if (elapsed.value < cumulative[i]) return i
  }
  return stages.length - 1
})

const effectiveActiveIndex = computed(() =>
  isComplete.value ? stages.length : animatedIndex.value,
)

const stageState = (i) => {
  if (i < effectiveActiveIndex.value) return 'done'
  if (i === effectiveActiveIndex.value && !isComplete.value) return 'active'
  return 'pending'
}

// ---------- Brief meta + counts -----------------------------------------
const transcript = computed(() => calls.activeCall?.transcript ?? '')

const wordCount = computed(() => {
  const t = transcript.value.trim()
  return t ? t.split(/\s+/).length : 0
})

const microsite = computed(() => calls.microsite)
const content = computed(() => microsite.value?.content ?? null)

const briefTitle = computed(
  () => content.value?.title ?? 'Generating brief…',
)
const briefContext = computed(() => {
  const p = content.value?.participants
  if (!p) return null
  const meeting = p.meeting_type ?? 'Call'
  const rep = p.rep?.name ?? 'Rep'
  const prospect = p.prospect?.name ?? p.prospect?.company ?? 'Prospect'
  return `${meeting} • ${rep} ↔ ${prospect}`
})
const callMin = computed(() => content.value?.meta?.call_min ?? null)
const turns = computed(() => content.value?.meta?.turns ?? null)

// ---------- Time display ------------------------------------------------
const fmtTime = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
const elapsedLabel = computed(() => fmtTime(elapsed.value))

// ---------- Actions -----------------------------------------------------
const viewBrief = () => {
  if (!isComplete.value) return
  // Land on Detail with the preview rail already open — first-time
  // post-generation, the rep wants to see what they're about to ship.
  router.push(`/briefs/${props.id}?preview=true`)
}
const goBriefs = () => router.push('/briefs')

const retrying = ref(false)
const handleRetry = async () => {
  if (retrying.value) return
  retrying.value = true
  startedAt.value = performance.now()
  elapsed.value = 0
  await calls.retry()
  retrying.value = false
}

// ---------- Floating highlight (slides between active rows) -------------
const liRefs = ref([])
const setLiRef = (el, i) => {
  if (el) liRefs.value[i] = el
}
const highlight = ref({ top: 0, height: 0, visible: false })

const updateHighlight = () => {
  if (isComplete.value || isFailed.value) {
    highlight.value = { ...highlight.value, visible: false }
    return
  }
  const el = liRefs.value[effectiveActiveIndex.value]
  if (!el) return
  highlight.value = {
    top: el.offsetTop,
    height: el.offsetHeight,
    visible: true,
  }
}

watch(
  [effectiveActiveIndex, isComplete, isFailed],
  () => nextTick(updateHighlight),
  { immediate: true },
)

const onResize = () => updateHighlight()
onMounted(() => {
  nextTick(updateHighlight)
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => window.removeEventListener('resize', onResize))
</script>

<template>
  <div
    class="min-h-screen flex flex-col bg-bg"
    data-screen-label="BriefProcessing"
  >
    <!-- Top bar -->
    <header class="bg-surface border-b border-ink-150">
      <div class="h-14 px-[28px] flex items-center gap-3">
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
          <span class="text-ink-900 font-medium truncate">{{ briefTitle }}</span>
        </div>

        <button
          type="button"
          :disabled="!isComplete"
          class="ml-auto inline-flex items-center gap-2 px-[18px] py-[10px] rounded-[10px] font-semibold border transition-colors"
          :class="
            isComplete
              ? 'bg-accent hover:bg-accent-strong text-accent-ink border-accent-strong shadow-cta cursor-pointer'
              : 'bg-ink-100 text-ink-400 border-ink-150 cursor-not-allowed'
          "
          @click="viewBrief"
        >
          View brief
          <IconArrowRight :size="14" :sw="2" />
        </button>
      </div>
      <div class="h-[3px] bg-accent" />
    </header>

    <main class="flex-1 px-[28px] pt-[56px] pb-[80px]">
      <div class="max-w-[640px] mx-auto flex flex-col gap-[40px]">
        <div
          v-if="calls.loading && !calls.activeCall"
          class="text-center text-ink-500 py-[80px]"
        >
          Loading brief…
        </div>

        <div v-else-if="isMissing" class="text-center py-[80px]">
          <div class="text-ink-900 font-medium mb-2">Brief not found</div>
          <div class="text-ink-500 text-[13px]">
            This brief may have been deleted, or the link is wrong.
          </div>
          <button
            type="button"
            class="mt-5 inline-flex items-center gap-2 px-[14px] py-[8px] rounded-[8px] bg-surface border border-ink-150 text-ink-900 font-medium cursor-pointer"
            @click="goBriefs"
          >
            ← Back to briefs
          </button>
        </div>

        <template v-else-if="calls.activeCall">
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
              {{ briefTitle }}
            </h1>

            <div class="mt-[8px] text-ink-500 min-h-[20px]">
              {{ briefContext ?? '—' }}
            </div>

            <div
              class="mt-[22px] flex flex-wrap gap-x-[28px] gap-y-2 text-ink-500"
            >
              <div v-if="callMin != null">
                <span class="text-ink-900 font-semibold">{{ callMin }}m</span>
                <span class="ml-[6px]">call</span>
              </div>
              <div>
                <span class="text-ink-900 font-semibold mono">{{
                  wordCount.toLocaleString()
                }}</span>
                <span class="ml-[6px]">words</span>
              </div>
              <div v-if="turns != null">
                <span class="text-ink-900 font-semibold mono">{{ turns }}</span>
                <span class="ml-[6px]">turns</span>
              </div>
            </div>
          </section>

          <!-- Failed state -->
          <section
            v-if="isFailed"
            class="rounded-[14px] p-[24px] border"
            style="
              background: color-mix(in oklch, var(--danger) 6%, white 94%);
              border-color: color-mix(in oklch, var(--danger) 25%, white 75%);
            "
          >
            <div class="flex items-start gap-[12px]">
              <span
                class="shrink-0 w-[28px] h-[28px] rounded-full grid place-items-center"
                style="
                  background: color-mix(in oklch, var(--danger) 18%, white 82%);
                  color: color-mix(in oklch, var(--danger) 70%, black 30%);
                "
              >
                <IconX :size="14" :sw="2.4" />
              </span>
              <div class="flex-1 min-w-0">
                <div class="text-[15px] font-semibold text-ink-900">
                  Generation failed
                </div>
                <div class="text-ink-500 mt-[3px] text-[13.5px]">
                  Something went wrong while generating this brief. The
                  transcript is safe — you can retry without re-pasting.
                </div>
                <div class="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    :disabled="retrying"
                    class="inline-flex items-center gap-2 px-[14px] py-[8px] rounded-[8px] font-semibold transition-colors border"
                    :class="
                      retrying
                        ? 'bg-ink-100 text-ink-400 border-ink-150 cursor-not-allowed'
                        : 'bg-accent hover:bg-accent-strong text-accent-ink border-accent-strong shadow-cta cursor-pointer'
                    "
                    @click="handleRetry"
                  >
                    <IconSparkle :size="13" :sw="2" />
                    {{ retrying ? 'Retrying…' : 'Retry' }}
                  </button>
                  <button
                    type="button"
                    class="text-[13px] text-ink-700 bg-transparent border-0 cursor-pointer p-0 font-medium"
                    @click="goBriefs"
                  >
                    Back to briefs
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Pipeline -->
          <section v-else>
            <div class="flex items-center justify-between">
              <div class="eyebrow">Pipeline</div>
              <div class="text-ink-500 text-[12.5px]">
                <template v-if="isComplete">
                  completed in
                  <span class="mono text-ink-900">{{ elapsedLabel }}</span>
                </template>
                <template v-else>
                  Generating ·
                  <span class="mono text-ink-900">{{ elapsedLabel }}</span>
                </template>
              </div>
            </div>

            <ol class="relative mt-[22px] flex flex-col gap-[6px] isolate">
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
                <span class="shrink-0 mt-[1px] grid place-items-center">
                  <span
                    v-if="stageState(i) === 'done'"
                    class="w-[20px] h-[20px] rounded-full grid place-items-center bg-accent text-accent-ink border border-accent-strong"
                  >
                    <IconCheck :size="12" :sw="2.4" />
                  </span>

                  <span
                    v-else-if="stageState(i) === 'active'"
                    class="relative w-[20px] h-[20px] grid place-items-center"
                  >
                    <span
                      class="w-[14px] h-[14px] rounded-full bg-surface border border-accent-strong"
                    />
                    <span
                      class="absolute inset-0 rounded-full border-[1.5px] border-transparent spinner-arc"
                    />
                  </span>

                  <span
                    v-else
                    class="w-[20px] h-[20px] rounded-full bg-surface border border-ink-300"
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
        </template>
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
