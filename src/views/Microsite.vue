<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import Header from "@/components/microsite/Header.vue";
import Greeting from "@/components/microsite/Greeting.vue";
import Tabs from "@/components/microsite/Tabs.vue";
import HeardTab from "@/components/microsite/HeardTab.vue";
import WhyTab from "@/components/microsite/WhyTab.vue";
import Footer from "@/components/microsite/Footer.vue";
import ShareCard from "@/components/microsite/ShareCard.vue";
import StickyCTA from "@/components/microsite/StickyCTA.vue";
import { getMicrositeBySlug } from "@/services/microsites";

const route = useRoute();

const tab = ref(localStorage.getItem("ms.tab") || "heard");
watch(tab, (v) => {
  localStorage.setItem("ms.tab", v);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Fetched microsite content + created_at. Null until the request resolves
// (or stays null on the demo route with no slug). Components fall back to
// the mock data when content is null so the demo route keeps working.
const content = ref(null);
const createdAt = ref(null);

const fetchMicrosite = async (slug) => {
  if (!slug) return;
  const { data, error } = await getMicrositeBySlug(slug);
  if (error) {
    console.error("[microsite] fetch error:", error);
    return;
  }
  if (!data) {
    console.warn(`[microsite] no row found for slug "${slug}"`);
    return;
  }
  content.value = data.content;
  createdAt.value = data.created_at;
  console.log("[microsite] fetched:", data);
};

watch(() => route.params.id, fetchMicrosite, { immediate: true });
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
      <Header :content="content" :created-at="createdAt" />
      <Greeting
        :content="content?.header"
        :brief-owner="content?.brief_owner"
      />
      <Tabs v-model="tab" />
      <div class="px-6 pt-[6px] pb-7 flex flex-col gap-7">
        <HeardTab v-if="tab === 'heard'" :content="content" />
        <WhyTab v-else />
        <ShareCard :company="content?.participants?.prospect?.company" />
      </div>
      <Footer
        :participants="content?.participants"
        :slug="route.params.id"
      />
    </div>

    <StickyCTA :brief-owner="content?.brief_owner" />
  </div>
</template>
