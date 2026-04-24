<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import AppModal from './AppModal.vue'
import { useNewBriefModal } from '@/composables/useNewBriefModal'
import { IconSparkle, IconDoc, IconClock } from './icons'

const { isOpen, close } = useNewBriefModal()

const transcript = ref('')
const textareaRef = ref(null)

const charCount = computed(() => transcript.value.trim().length)
const canGenerate = computed(() => charCount.value > 0)
const statusLabel = computed(() =>
  charCount.value === 0
    ? 'empty'
    : `${charCount.value.toLocaleString()} chars`,
)

watch(isOpen, (open) => {
  if (open) {
    nextTick(() => textareaRef.value?.focus())
  } else {
    transcript.value = ''
  }
})

const handleGenerate = () => {
  if (!canGenerate.value) return
  close()
}

const placeholder = `Paste your transcript here…

[00:12] Ava: Thanks for making time today — I know your quarter is packed.
[00:18] Jess: Happy to. We're really looking at three things for Q2…`
</script>

<template>
  <AppModal :open="isOpen" width="640px" @close="close">
    <template #header>
      <div class="flex items-start gap-4">
        <div
          class="w-[42px] h-[42px] grid place-items-center rounded-[10px] border border-ink-150 bg-ink-100 text-ink-900 shrink-0"
        >
          <IconSparkle :size="18" :sw="2" />
        </div>
        <div class="flex-1 min-w-0">
          <div
            class="text-[22px] font-semibold text-ink-900"
            style="letter-spacing: -0.02em"
          >
            New Brief
          </div>
          <div class="text-ink-500 mt-1">
            Paste a call transcript. We'll turn it into a personalized microsite for your buyer.
          </div>
        </div>
      </div>
    </template>

    <div class="flex items-center justify-between mb-[10px]">
      <label class="font-medium text-ink-900">Call transcript</label>
      <span
        class="mono text-[11px] text-ink-500 px-[8px] py-[3px] rounded-full bg-ink-100"
      >
        {{ statusLabel }}
      </span>
    </div>

    <textarea
      ref="textareaRef"
      v-model="transcript"
      rows="10"
      :placeholder="placeholder"
      class="w-full min-h-[220px] resize-y rounded-[12px] border border-ink-200 bg-surface p-4 outline-none text-ink-900 placeholder:text-ink-400 focus:border-ink-900 transition-colors leading-[1.5]"
    />

    <div class="flex flex-wrap gap-2 mt-4">
      <span
        class="inline-flex items-center gap-2 px-[10px] py-[6px] rounded-full bg-ink-100 text-ink-700 text-[12.5px]"
      >
        <IconDoc :size="13" />
        Works with Zoom, Gong, Chorus, or plain text
      </span>
      <span
        class="inline-flex items-center gap-2 px-[10px] py-[6px] rounded-full bg-ink-100 text-ink-700 text-[12.5px]"
      >
        <IconClock :size="13" />
        ~6 min to generate
      </span>
    </div>

    <template #footer>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-[12.5px] text-ink-500">
          <span
            class="mono px-[6px] py-[2px] border border-ink-150 rounded-xs bg-bg"
          >
            Esc
          </span>
          <span>to cancel</span>
        </div>
        <button
          :disabled="!canGenerate"
          type="button"
          class="inline-flex items-center gap-2 px-5 py-[10px] rounded-[10px] font-semibold transition-colors"
          :class="
            canGenerate
              ? 'bg-accent hover:bg-accent-strong text-accent-ink border border-accent-strong shadow-cta cursor-pointer'
              : 'bg-ink-100 text-ink-500 border border-ink-150 cursor-not-allowed'
          "
          @click="handleGenerate"
        >
          <IconSparkle :size="15" :sw="2" />
          Generate Microsite
        </button>
      </div>
    </template>
  </AppModal>
</template>
