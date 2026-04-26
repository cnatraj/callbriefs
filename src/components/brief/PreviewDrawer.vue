<script setup>
import { ref, watch } from 'vue'
import AppDrawer from '@/components/AppDrawer.vue'
import MicrositeBody from '@/components/microsite/MicrositeBody.vue'
import { usePreviewDrawer } from '@/composables/usePreviewDrawer'
import { getMicrositeById } from '@/services/microsites'

const { isOpen, activeMicrositeId, close } = usePreviewDrawer()

const microsite = ref(null)
const loading = ref(false)

// Fetch whenever the active id changes (and the drawer is open).
// Same id → no refetch (microsite stays in place if drawer reopens).
watch(
  [isOpen, activeMicrositeId],
  async ([open, id]) => {
    if (!open || !id) return
    if (microsite.value?.id === id) return
    loading.value = true
    microsite.value = null
    const { data, error } = await getMicrositeById(id)
    if (error) {
      console.error('[preview] fetch error:', error)
    } else {
      microsite.value = data
    }
    loading.value = false
  },
  { immediate: true },
)
</script>

<template>
  <AppDrawer :open="isOpen" width="500px" @close="close">
    <template #header>
      <div class="eyebrow text-ink-500 mb-[6px]">
        Preview · as the prospect sees it
      </div>
      <div
        class="text-[18px] font-semibold text-ink-900 truncate"
        style="letter-spacing: -0.015em"
      >
        {{ microsite?.content?.title ?? 'Brief' }}
      </div>
    </template>

    <!-- Dotted backdrop fills the body area. Negative margins cancel the
         AppDrawer's px-6 py-6 so the dots go edge-to-edge. -->
    <div
      class="-mx-6 -my-6 min-h-full flex justify-center px-[30px] py-[32px]"
      style="
        background: var(--bg);
        background-image: radial-gradient(
          circle at 1px 1px,
          var(--ink-200) 1px,
          transparent 0
        );
        background-size: 22px 22px;
      "
    >
      <div
        v-if="loading && !microsite"
        class="text-ink-500 text-[13px] py-[40px]"
      >
        Loading preview…
      </div>
      <MicrositeBody
        v-else
        :content="microsite?.content"
        :created-at="microsite?.created_at"
        :slug="microsite?.slug"
      />
    </div>
  </AppDrawer>
</template>
