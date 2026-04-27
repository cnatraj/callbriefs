<script setup>
import { computed } from "vue";
import { MICROSITE } from "@/data/microsite";
import { IconMail } from "@/components/icons";

const props = defineProps({
  content: { type: Object, default: null },
  briefOwner: { type: Object, default: null },
});

const eyebrow = computed(
  () => props.content?.title ?? MICROSITE.greeting.eyebrow,
);
const title = computed(
  () => props.content?.outcome_headline ?? MICROSITE.greeting.title,
);

const summary = computed(
  () => props.content?.summary ?? MICROSITE.greeting.lede,
);

const ownerInitials = computed(
  () => props.briefOwner?.initials ?? MICROSITE.rep.initials,
);
const ownerName = computed(() => props.briefOwner?.name ?? MICROSITE.rep.name);
const ownerEmail = computed(
  () => props.briefOwner?.email ?? MICROSITE.rep.email,
);
</script>

<template>
  <div class="px-6 pt-[22px] pb-1" data-section-name="greeting">
    <div class="eyebrow mb-[10px]">{{ eyebrow }}</div>
    <h1
      class="text-[26px] font-semibold text-ink-900 m-0"
      style="letter-spacing: -0.025em; line-height: 1.15; text-wrap: balance"
    >
      {{ title }}
    </h1>
    <p class="text-[14.5px] text-ink-500 leading-[1.5] mt-[10px] mb-0">
      {{ summary }}
    </p>

    <!-- Byline -->
    <div
      class="flex items-center gap-[10px] mt-4 px-3 py-[10px] rounded-[10px] bg-nav-bg border border-ink-100"
    >
      <div
        class="w-[30px] h-[30px] rounded-full bg-ink-900 text-bg grid place-items-center text-[11px] font-semibold shrink-0"
      >
        {{ ownerInitials }}
      </div>
      <div class="flex-1 min-w-0">
        <div
          class="text-[13px] font-medium text-ink-900 truncate leading-[1.25]"
        >
          {{ ownerName }}
        </div>
        <div class="text-[11.5px] text-ink-500 truncate leading-[1.3] mt-[2px]">
          {{ ownerEmail }} · replies within the hour
        </div>
      </div>
      <a
        :href="`mailto:${ownerEmail}`"
        target="_blank"
        rel="noopener noreferrer"
        data-tracking-event="cta_clicked"
        data-tracking-cta="email_rep"
        class="shrink-0 w-[32px] h-[32px] grid place-items-center rounded-[8px] text-ink-700 border border-ink-150 bg-surface hover:bg-ink-100 transition-colors"
        :title="`Email ${ownerName}`"
        :aria-label="`Email ${ownerName}`"
      >
        <IconMail :size="14" />
      </a>
    </div>
  </div>
</template>
