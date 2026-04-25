<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import AppModal from './AppModal.vue'
import { useNewBriefModal } from '@/composables/useNewBriefModal'
import { useOrgStore } from '@/stores/org'
import * as callsService from '@/services/calls'
import * as documentsService from '@/services/documents'
import { IconSparkle, IconDoc, IconClock } from './icons'

const { isOpen, close } = useNewBriefModal()
const router = useRouter()
const org = useOrgStore()

const transcript = ref('')
const textareaRef = ref(null)
const submitting = ref(false)
const errorMsg = ref('')

const charCount = computed(() => transcript.value.trim().length)
const canGenerate = computed(() => charCount.value > 0 && !submitting.value)
const statusLabel = computed(() =>
  charCount.value === 0
    ? 'empty'
    : `${charCount.value.toLocaleString()} chars`,
)

watch(isOpen, (open) => {
  if (open) {
    nextTick(() => textareaRef.value?.focus())
    errorMsg.value = ''
  } else {
    transcript.value = ''
    errorMsg.value = ''
    submitting.value = false
  }
})

const handleGenerate = async () => {
  if (!canGenerate.value) return
  errorMsg.value = ''
  submitting.value = true

  try {
    const orgId = org.currentOrgId
    const workspaceId = org.currentWorkspaceId
    if (!orgId || !workspaceId) {
      errorMsg.value = 'No active workspace.'
      return
    }

    // Preflight: workspace must have at least one ready knowledge doc.
    const { count, error: countErr } =
      await documentsService.getReadyDocumentCount(workspaceId)
    if (countErr) {
      errorMsg.value = countErr.message
      return
    }
    if (count === 0) {
      errorMsg.value =
        'Add at least one knowledge article to this workspace before generating a brief.'
      return
    }

    const { data, error: insertErr } = await callsService.createCall({
      orgId,
      workspaceId,
      transcript: transcript.value.trim(),
    })
    if (insertErr) {
      errorMsg.value = insertErr.message
      return
    }

    close()
    router.push(`/briefs/processing/${data.id}`)
  } finally {
    submitting.value = false
  }
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

    <div
      v-if="errorMsg"
      class="mt-4 px-[12px] py-[10px] rounded-[10px] border text-[13px]"
      style="
        background: color-mix(in oklch, var(--danger) 8%, white 92%);
        border-color: color-mix(in oklch, var(--danger) 30%, white 70%);
        color: color-mix(in oklch, var(--danger) 70%, black 30%);
      "
    >
      {{ errorMsg }}
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
          {{ submitting ? 'Starting…' : 'Generate Microsite' }}
        </button>
      </div>
    </template>
  </AppModal>
</template>
