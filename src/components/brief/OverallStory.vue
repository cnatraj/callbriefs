<script setup>
import { computed } from "vue";
import {
  IconDoc,
  IconSparkles,
  IconRotateCcw,
  IconArrowDownToLine,
  IconUsers,
  IconEye,
} from "@/components/icons";
import SuggestedEmailCopy from "./SuggestedEmailCopy.vue";

const props = defineProps({
  prospectFirstName: { type: String, default: "Maya" },
  prospectCompany: { type: String, default: "Acuity Robotics" },
  // microsites.overall_narrative — { narrative, signals } | null
  overallNarrative: { type: Object, default: null },
  // microsite slug — used to build the public URL inside the embedded
  // SuggestedEmailCopy email body.
  slug: { type: String, default: null },
});

const hasNarrative = computed(() => !!props.overallNarrative?.narrative);

// ==highlight== → citron-tinted span. Bold is reserved for per-session narratives.
const formattedNarrative = computed(() => {
  const text = props.overallNarrative?.narrative ?? "";
  return text.replace(
    /==(.+?)==/g,
    '<span class="px-[3px] py-[1px] rounded-[3px]" style="background: color-mix(in oklch, var(--accent) 32%, white 68%);">$1</span>',
  );
});

// Derive a small set of pills from overall.signals. Order = priority:
// returning > forwarded > viewer count > engagement quality.
const COMPLETION_LABELS = {
  glance: "Quick glance",
  skim: "Skimmed",
  read: "Read through",
  deep: "Deep read",
};

const overallPills = computed(() => {
  const s = props.overallNarrative?.signals;
  if (!s) return [];
  const pills = [];

  if (s.has_returning_viewer) {
    pills.push({ label: "Returning viewer", icon: IconRotateCcw });
  }
  if (s.forwarded) {
    pills.push({ label: "Forwarded internally", icon: IconArrowDownToLine });
  }
  if (typeof s.unique_fingerprints === "number" && s.unique_fingerprints >= 1) {
    pills.push({
      label: `${s.unique_fingerprints} ${s.unique_fingerprints === 1 ? "viewer" : "viewers"}`,
      icon: IconUsers,
    });
  }
  if (s.completion && COMPLETION_LABELS[s.completion]) {
    pills.push({
      label: COMPLETION_LABELS[s.completion],
      icon: s.completion === "deep" ? IconSparkles : IconEye,
    });
  }
  return pills;
});
</script>

<template>
  <section
    class="rounded-[14px] border border-ink-150 bg-surface px-[28px] py-[28px] overflow-hidden"
  >
    <!-- Has narrative: show the LLM's overall story across all sessions -->
    <div v-if="hasNarrative">
      <div class="flex items-start gap-[16px]">
        <span
          class="w-[44px] h-[44px] rounded-[10px] grid place-items-center bg-ink-100 text-ink-500 shrink-0"
        >
          <IconSparkles :size="20" />
        </span>

        <div class="flex-1 min-w-0">
          <div class="eyebrow text-ink-500">Overall story</div>
          <p
            class="mt-[14px] text-[16px] leading-[1.6] text-ink-900"
            v-html="formattedNarrative"
          ></p>

          <div
            v-if="overallPills.length"
            class="mt-[14px] pt-[14px] border-t border-dashed border-ink-200 flex flex-wrap gap-[8px]"
          >
            <span
              v-for="(pill, i) in overallPills"
              :key="i"
              class="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[12px] font-medium"
              style="
                background: color-mix(in oklch, var(--accent) 22%, white 78%);
                color: var(--accent-ink);
              "
            >
              <component :is="pill.icon" :size="12" />
              {{ pill.label }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- No narrative yet: waiting / explainer -->
    <div v-else>
      <div class="flex items-start gap-[16px]">
        <span
          class="w-[44px] h-[44px] rounded-[10px] grid place-items-center bg-ink-100 text-ink-500 shrink-0"
        >
          <IconDoc :size="20" />
        </span>

        <div class="flex-1 min-w-0">
          <div class="eyebrow text-ink-500">
            The Story · Waiting for first view
          </div>

          <p class="mt-[14px] text-[16px] leading-[1.6] text-ink-900">
            Your microsite for
            <span class="font-semibold">{{ prospectCompany }}</span> is live and
            the link is ready to be shared. To get started, copy the link above
            and paste it into an email to {{ prospectFirstName }}.
          </p>
          <p class="mt-[14px] text-[16px] leading-[1.6] text-ink-900">
            <span class="text-ink-500">
              The moment they open it, you'll see which sections they actually
              read, which they skimmed, and whether they came back —
            </span>

            <span
              class="px-[4px] py-[1px] rounded-[3px]"
              style="
                background: color-mix(in oklch, var(--accent) 32%, white 68%);
              "
            >
              so you always know the right time to follow up.
            </span>
          </p>
        </div>
      </div>
    </div>

    <SuggestedEmailCopy
      :slug="slug"
      :prospect-first-name="prospectFirstName"
      :prospect-company="prospectCompany"
    />
  </section>
</template>
