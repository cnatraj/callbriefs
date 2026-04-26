<script setup>
import { computed } from "vue";

const props = defineProps({
  content: { type: Object, default: null },
  createdAt: { type: String, default: null },
});

const closer = computed(() => props.content?.closer);
const ownerName = computed(() => props.content?.brief_owner?.name);
const prospectFirstName = computed(
  () => props.content?.participants?.prospect?.firstName,
);

const formattedDate = computed(() => {
  if (!props.createdAt) return null;
  const d = new Date(props.createdAt);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
});

const byline = computed(() => {
  const parts = [];
  if (ownerName.value) {
    parts.push(
      prospectFirstName.value
        ? `Drafted by ${ownerName.value} for ${prospectFirstName.value}`
        : `Drafted by ${ownerName.value}`,
    );
  }
  if (formattedDate.value) parts.push(formattedDate.value);
  return parts.join(" · ");
});
</script>

<template>
  <section
    v-if="closer"
    class="relative overflow-hidden rounded-[14px] px-[24px] pt-[24px] pb-[18px] bg-ink-900"
    style="
      background-image: radial-gradient(
        circle at 100% 0%,
        color-mix(in oklch, var(--accent) 35%, transparent 65%) 0%,
        transparent 55%
      );
    "
  >
    <div class="flex items-center gap-[10px] mb-[14px]">
      <span
        class="w-[16px] h-[16px] rounded-full grid place-items-center shrink-0"
        style="border: 1.5px solid var(--accent)"
      >
        <span class="w-[5px] h-[5px] rounded-full bg-accent inline-block" />
      </span>
      <span
        class="eyebrow mono"
        style="color: var(--accent); letter-spacing: 0.08em"
      >
        In closing
      </span>
    </div>

    <p
      class="text-[18px] text-bg leading-[1.45] m-0"
      style="letter-spacing: -0.01em"
    >
      {{ closer }}
    </p>
  </section>
</template>
