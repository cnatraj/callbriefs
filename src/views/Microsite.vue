<script setup>
import { ref, watch } from 'vue'
import Header from '@/components/microsite/Header.vue'
import Greeting from '@/components/microsite/Greeting.vue'
import Tabs from '@/components/microsite/Tabs.vue'
import HeardTab from '@/components/microsite/HeardTab.vue'
import WhyTab from '@/components/microsite/WhyTab.vue'
import Footer from '@/components/microsite/Footer.vue'
import StickyCTA from '@/components/microsite/StickyCTA.vue'

const tab = ref(localStorage.getItem('ms.tab') || 'heard')
watch(tab, (v) => {
  localStorage.setItem('ms.tab', v)
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
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
    <div
      class="relative w-full max-w-[440px] flex flex-col bg-surface border border-ink-150 rounded-[20px] overflow-hidden"
      style="
        box-shadow:
          0 24px 60px -30px rgba(20, 20, 20, 0.18),
          0 2px 6px rgba(20, 20, 20, 0.03);
      "
    >
      <Header />
      <Greeting />
      <Tabs v-model="tab" />
      <div class="px-6 pt-[6px] pb-7 flex flex-col gap-7">
        <HeardTab v-if="tab === 'heard'" />
        <WhyTab v-else />
      </div>
      <Footer />
    </div>

    <StickyCTA />
  </div>
</template>
