<script setup>
import { computed } from "vue";
import {
  IconSparkles,
  IconRotateCcw,
  IconEye,
  IconArrowDownToLine,
  IconGlobe,
  IconMonitor,
  IconPhone,
  IconChevronDown,
} from "@/components/icons";

const props = defineProps({
  session: { type: Object, required: true },
});

// Status pill (top): kind of viewer this is.
const STATUS_MAP = {
  new_viewer: { label: "New viewer", icon: IconSparkles },
  returning: { label: "Returning visitor", icon: IconRotateCcw },
  first_view: { label: "First view", icon: IconEye },
  forwarded: { label: "Forwarded", icon: IconArrowDownToLine },
};

const statusMeta = computed(() => STATUS_MAP[props.session.status] ?? null);

// Best signal pill (bottom): citron-tinted takeaway.
const SIGNAL_ICONS = {
  buying: IconSparkles,
  forwarded: IconArrowDownToLine,
  mobile: IconPhone,
  returning: IconRotateCcw,
};

const signalIcon = computed(
  () => SIGNAL_ICONS[props.session.best_signal?.icon] ?? IconSparkles,
);

// Device pill (right): little device glyph + "desktop · Chrome".
const isMobileDevice = computed(() =>
  ["mobile", "iphone", "tablet"].includes(
    (props.session.device?.type ?? "").toLowerCase(),
  ),
);

// Render the narrative with simple inline markup.
//   **bold**    → <strong>
//   ==highlight== → citron-tinted <span>
// Mock-only for now; replace with a structured token format when the LLM
// starts returning richer output.
const formattedNarrative = computed(() => {
  const text = props.session.narrative ?? "";
  return text
    .replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="font-semibold text-ink-900">$1</strong>',
    )
    .replace(
      /==(.+?)==/g,
      '<span class="px-[3px] py-[1px] rounded-[3px]" style="background: color-mix(in oklch, var(--accent) 32%, white 68%);">$1</span>',
    );
});
</script>

<template>
  <article
    class="rounded-[14px] border bg-surface px-[24px] py-[20px]"
    :class="
      session.is_active
        ? 'border-[color:color-mix(in_oklch,var(--accent)_45%,var(--ink-150))]'
        : 'border-ink-150'
    "
    :style="
      session.is_active
        ? 'background: color-mix(in oklch, var(--accent) 7%, var(--surface) 93%);'
        : ''
    "
  >
    <!-- Top row: when + who + device -->
    <div class="flex items-start gap-[12px] flex-wrap">
      <div class="flex flex-col gap-[2px]">
        <div class="text-[14px] font-medium text-ink-900">
          {{ session.date_label }}
        </div>
        <div class="mono text-[11.5px] text-ink-500">
          {{ session.time_label }}
        </div>
      </div>

      <div class="flex items-center gap-[8px] flex-wrap">
        <span
          v-if="statusMeta"
          class="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[12px] font-medium"
          style="
            background: color-mix(in oklch, var(--accent) 22%, white 78%);
            color: var(--accent-ink);
          "
        >
          <component :is="statusMeta.icon" :size="12" />
          {{ statusMeta.label }}
        </span>

        <span
          v-if="session.is_still_reading"
          class="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[12px] text-ink-700 bg-surface border border-ink-150"
        >
          <IconGlobe :size="12" />
          still reading
        </span>

        <span class="text-[12.5px] text-ink-500">
          {{ session.viewer_label }}
        </span>
      </div>

      <span
        class="ml-auto inline-flex items-center gap-[6px] text-[12.5px] text-ink-500 mono shrink-0"
      >
        <component :is="isMobileDevice ? IconPhone : IconMonitor" :size="13" />
        {{ session.device?.label }}
      </span>
    </div>

    <!-- Narrative -->
    <p
      class="mt-[16px] text-[14px] leading-[1.6] text-ink-700"
      v-html="formattedNarrative"
    />

    <!-- Read map line -->
    <button
      type="button"
      class="mt-[14px] flex items-center justify-between w-full text-[12.5px] text-ink-500 cursor-pointer bg-transparent border-0 p-0"
    >
      <span>
        Show read map ·
        <span class="mono text-ink-700">
          {{ session.sections_reached }} of {{ session.sections_total }}
        </span>
        sections reached
      </span>
      <IconChevronDown :size="12" />
    </button>

    <!-- Signal pills -->
    <div
      class="mt-[14px] pt-[14px] border-t border-dashed border-ink-200 flex items-center gap-[8px] flex-wrap"
    >
      <span
        v-if="session.best_signal"
        class="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[12px] font-medium"
        style="
          background: color-mix(in oklch, var(--accent) 22%, white 78%);
          color: var(--accent-ink);
        "
      >
        <component :is="signalIcon" :size="12" />
        {{ session.best_signal.label }}
      </span>

      <span
        v-for="(pill, i) in session.detail_pills"
        :key="i"
        class="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[12px] text-ink-700 bg-surface border border-ink-150"
      >
        <component
          v-if="typeof pill === 'object' && pill.icon"
          :is="pill.icon"
          :size="12"
        />
        {{ typeof pill === "object" ? pill.label : pill }}
      </span>

      <span class="ml-auto mono text-[11px] text-ink-500">
        #{{ session.id }}
      </span>
    </div>
  </article>
</template>
