<script setup>
// Populated session-feed view. Renders once the microsite has at least
// one tracked event. Today this is a placeholder — Detail.vue always
// mounts <StoryEmpty /> instead. When event tracking lands, this is
// where the per-session narrative cards go.
defineProps({
  slug: { type: String, default: null },
});
</script>

<template>
  <section
    class="rounded-[14px] border border-ink-150 bg-surface px-[28px] py-[36px] text-center text-ink-500 text-[13px]"
  >
    Story feed — TODO once event tracking lands.
  </section>
</template>
