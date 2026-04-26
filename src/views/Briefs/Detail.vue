<script setup>
import { computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCallsStore } from '@/stores/calls'
import { usePreviewDrawer } from '@/composables/usePreviewDrawer'
import { IconSparkle, IconArrowUpRight, IconEye } from '@/components/icons'
import Story from '@/components/brief/Story.vue'

const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()
const route = useRoute()
const calls = useCallsStore()
const previewDrawer = usePreviewDrawer()

// On initial mount, send users to Processing if the brief isn't ready.
// Covers refresh, deep-link, and direct-URL cases.
const redirectIfNotReady = (status) => {
  if (status === 'processing' || status === 'failed') {
    router.replace(`/briefs/${props.id}/processing`)
  }
}

const maybeAutoOpenPreview = () => {
  if (route.query.preview !== 'true') return
  if (!calls.microsite?.id) return
  previewDrawer.open(calls.microsite.id)
}

onMounted(async () => {
  await calls.loadCall(props.id)
  redirectIfNotReady(calls.activeCall?.status)
  maybeAutoOpenPreview()
})
onBeforeUnmount(() => calls.reset())

watch(
  () => props.id,
  async (next) => {
    if (!next) return
    await calls.loadCall(next)
    redirectIfNotReady(calls.activeCall?.status)
    maybeAutoOpenPreview()
  },
)

const status = computed(() => calls.activeCall?.status ?? null)
const isReady = computed(() => status.value === 'ready')
const isMissing = computed(
  () => !calls.loading && !calls.activeCall && !!calls.loadedCallId,
)

const microsite = computed(() => calls.microsite)
const content = computed(() => microsite.value?.content ?? null)
const slug = computed(() => microsite.value?.slug ?? null)

const briefTitle = computed(() => content.value?.title ?? 'Brief')
const briefContext = computed(() => {
  const p = content.value?.participants
  if (!p) return null
  const meeting = p.meeting_type ?? 'Call'
  const rep = p.rep?.name ?? 'Rep'
  const prospect = p.prospect?.name ?? p.prospect?.company ?? 'Prospect'
  return `${meeting} • ${rep} ↔ ${prospect}`
})

const showPreview = () => {
  if (!microsite.value?.id) return
  previewDrawer.open(microsite.value.id)
}

const openProspectView = () => {
  if (!slug.value) return
  window.open(`/m/${slug.value}`, '_blank', 'noopener,noreferrer')
}
const goBriefs = () => router.push('/briefs')
</script>

<template>
  <div data-screen-label="BriefDetail">
    <!-- Loading -->
    <div
      v-if="calls.loading && !calls.activeCall"
      class="text-center text-ink-500 py-[80px]"
    >
      Loading brief…
    </div>

    <!-- Not found -->
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

    <!-- Ready state -->
    <div v-else-if="isReady" class="max-w-[760px] mx-auto flex flex-col gap-[24px]">
      <div class="flex items-center justify-end gap-[8px]">
        <button
          type="button"
          :disabled="!microsite?.id"
          class="inline-flex items-center gap-[6px] px-[12px] py-[8px] rounded-[8px] border border-ink-150 bg-surface text-ink-900 text-[12.5px] font-medium cursor-pointer hover:bg-ink-100 transition-colors disabled:cursor-not-allowed disabled:text-ink-400"
          @click="showPreview"
        >
          <IconEye :size="13" />
          Show preview
        </button>
        <button
          type="button"
          :disabled="!slug"
          class="inline-flex items-center gap-[6px] px-[12px] py-[8px] rounded-[8px] border text-[12.5px] font-medium transition-colors"
          :class="
            slug
              ? 'bg-ink-900 text-bg border-ink-900 cursor-pointer'
              : 'bg-ink-100 text-ink-400 border-ink-150 cursor-not-allowed'
          "
          @click="openProspectView"
        >
          Open as prospect
          <IconArrowUpRight :size="13" :sw="2" />
        </button>
      </div>

      <section class="bg-surface border border-ink-150 rounded-[14px] p-[24px]">
        <div class="flex items-center gap-[6px] eyebrow text-ink-500">
          <IconSparkle :size="12" :sw="2" />
          Brief
        </div>

        <h1
          class="mt-[12px] text-[24px] font-semibold text-ink-900"
          style="letter-spacing: -0.02em; line-height: 1.2"
        >
          {{ briefTitle }}
        </h1>

        <div v-if="briefContext" class="mt-[6px] text-ink-500 text-[13.5px]">
          {{ briefContext }}
        </div>
      </section>

      <Story :slug="slug" />
    </div>
  </div>
</template>
