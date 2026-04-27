<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCallsStore } from '@/stores/calls'
import { usePreviewDrawer } from '@/composables/usePreviewDrawer'
import BriefHero from '@/components/brief/BriefHero.vue'
import StoryEmpty from '@/components/brief/StoryEmpty.vue'
import Story from '@/components/brief/Story.vue'
import SignalsPreview from '@/components/brief/SignalsPreview.vue'
import ReminderStrip from '@/components/brief/ReminderStrip.vue'

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

const briefTitle = computed(
  () => content.value?.header?.title || 'Brief',
)

const prospectFirstName = computed(() => {
  const name =
    calls.activeCall?.prospect_name ||
    content.value?.participants?.prospect?.firstName ||
    content.value?.participants?.prospect?.name
  if (!name) return 'your prospect'
  return name.trim().split(/\s+/)[0]
})

const prospectCompany = computed(
  () =>
    calls.activeCall?.prospect_company ||
    content.value?.participants?.prospect?.company ||
    'their company',
)

// Story-feed switch — false until event tracking lands.
const hasViews = computed(() => false)

const showPreview = () => {
  if (!microsite.value?.id) return
  previewDrawer.open(microsite.value.id)
}

const openProspectView = () => {
  if (!slug.value) return
  // ?track=false suppresses event tracking — see event-tracking.md.
  window.open(`/m/${slug.value}?track=false`, '_blank', 'noopener,noreferrer')
}

const copied = ref(false)
let copyResetTimer = null
const copyShareLink = async () => {
  if (!slug.value) return
  const url = `${window.location.origin}/m/${slug.value}`
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    if (copyResetTimer) clearTimeout(copyResetTimer)
    copyResetTimer = setTimeout(() => (copied.value = false), 1500)
  } catch (err) {
    console.error('[brief-detail] clipboard write failed:', err)
  }
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
    <div
      v-else-if="isReady"
      class="max-w-[1080px] mx-auto flex flex-col gap-[20px]"
    >
      <BriefHero
        :title="briefTitle"
        :can-preview="!!microsite?.id"
        :can-share="!!slug"
        @preview="showPreview"
        @copy-link="copyShareLink"
        @open-as-prospect="openProspectView"
      />

      <StoryEmpty
        v-if="!hasViews"
        :slug="slug"
        :prospect-first-name="prospectFirstName"
        :prospect-company="prospectCompany"
      />
      <Story v-else :slug="slug" />

      <SignalsPreview :prospect-first-name="prospectFirstName" />

      <ReminderStrip :prospect-first-name="prospectFirstName" />
    </div>
  </div>
</template>
