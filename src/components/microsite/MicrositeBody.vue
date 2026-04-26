<script setup>
import { ref, watch } from 'vue'
import Header from './Header.vue'
import Greeting from './Greeting.vue'
import Tabs from './Tabs.vue'
import HeardTab from './HeardTab.vue'
import WhyTab from './WhyTab.vue'
import Footer from './Footer.vue'

defineProps({
  content: { type: Object, default: null },
  createdAt: { type: String, default: null },
  slug: { type: String, default: null },
})

// Tab state — same localStorage key across both rep preview and prospect
// view so the rep's last-viewed tab persists into the prospect render.
const tab = ref(localStorage.getItem('ms.tab') || 'heard')
watch(tab, (v) => {
  localStorage.setItem('ms.tab', v)
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<template>
  <div
    class="relative w-full max-w-[440px] flex flex-col bg-surface border border-ink-150 rounded-[20px] overflow-hidden"
    style="
      box-shadow:
        0 24px 60px -30px rgba(20, 20, 20, 0.18),
        0 2px 6px rgba(20, 20, 20, 0.03);
    "
  >
    <Header :content="content" :created-at="createdAt" />
    <Greeting
      :content="content?.header"
      :brief-owner="content?.brief_owner"
    />
    <Tabs v-model="tab" />
    <div class="px-6 pt-[6px] pb-7 flex flex-col gap-7">
      <HeardTab v-if="tab === 'heard'" :content="content" />
      <WhyTab v-else :content="content" :created-at="createdAt" />
    </div>
    <Footer
      :participants="content?.participants"
      :slug="slug"
      :org-name="content?.org?.name"
    />
  </div>
</template>
