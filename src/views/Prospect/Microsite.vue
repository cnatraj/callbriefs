<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import MicrositeBody from '@/components/microsite/MicrositeBody.vue'
import StickyCTA from '@/components/microsite/StickyCTA.vue'
import { getMicrositeBySlug } from '@/services/microsites'
import { initTracking, stopTracking } from '@/lib/tracking'

const route = useRoute()

// Fetched microsite content + created_at. Null until the request resolves
// (or stays null on the demo route with no slug). MicrositeBody falls back
// to mock data when content is null so the demo route keeps working.
const content = ref(null)
const createdAt = ref(null)

const fetchMicrosite = async (slug) => {
  if (!slug) return
  const { data, error } = await getMicrositeBySlug(slug)
  if (error) {
    console.error('[microsite] fetch error:', error)
    return
  }
  if (!data) {
    console.warn(`[microsite] no row found for slug "${slug}"`)
    return
  }
  content.value = data.content
  createdAt.value = data.created_at
  initTracking(data.id)
}

watch(() => route.params.id, fetchMicrosite, { immediate: true })

onBeforeUnmount(() => stopTracking())
</script>

<template>
  <div
    class="min-h-screen flex justify-center relative bg-bg"
    style="
      padding: 32px 16px 140px;
      background-image: radial-gradient(
        circle at 1px 1px,
        var(--ink-200) 1px,
        transparent 0
      );
      background-size: 22px 22px;
    "
    data-screen-label="Microsite"
  >
    <MicrositeBody
      :content="content"
      :created-at="createdAt"
      :slug="route.params.id"
    />

    <StickyCTA :brief-owner="content?.brief_owner" />
  </div>
</template>
