<script setup>
// MicrositeMetrics — headline stats for a brief, derived from per-session
// narratives. Renders three cells: unique viewers, total visits, last
// viewed. Shows a "Waiting for events" placeholder when there are no
// narrated sessions yet.

import { computed } from "vue";
import { IconUsers, IconEye, IconClock } from "@/components/icons";

const props = defineProps({
  // Array of microsite_session_narratives rows (status='ready' only — the
  // service filter handles that). Each row carries fingerprint_id,
  // session_id, session_start. Empty array → waiting state.
  narratives: { type: Array, default: () => [] },
});

const hasData = computed(() => props.narratives.length > 0);

// Count of distinct viewers (devices) across narrated sessions.
const uniqueViewers = computed(() => {
  const set = new Set(
    props.narratives.map((n) => n.fingerprint_id).filter(Boolean),
  );
  return set.size;
});

// Count of distinct narrated sessions.
const totalVisits = computed(() => {
  const set = new Set(
    props.narratives.map((n) => n.session_id).filter(Boolean),
  );
  return set.size;
});

// Most recent session_start across all narratives. ISO string or null.
const lastViewedAt = computed(() => {
  const times = props.narratives
    .map((n) => n.session_start)
    .filter(Boolean)
    .map((s) => new Date(s).getTime());
  if (!times.length) return null;
  return new Date(Math.max(...times)).toISOString();
});

// Format an ISO timestamp as a relative-time short string, falling back
// to a calendar date past 7 days. Returns "—" when input is null.
const formatLastViewed = (iso) => {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// Calendar-style subtitle for "Last viewed" — short date + time.
const formatLastViewedSub = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const cells = computed(() => [
  {
    icon: IconUsers,
    label: "Unique viewers",
    value: String(uniqueViewers.value),
    sub: `${totalVisits.value} ${totalVisits.value === 1 ? "visit" : "visits"} total`,
  },
  {
    icon: IconEye,
    label: "Total visits",
    value: String(totalVisits.value),
    sub: `Across ${uniqueViewers.value} ${uniqueViewers.value === 1 ? "viewer" : "viewers"}`,
  },
  {
    icon: IconClock,
    label: "Last viewed",
    value: formatLastViewed(lastViewedAt.value),
    sub: formatLastViewedSub(lastViewedAt.value),
  },
]);
</script>

<template>
  <section
    class="rounded-[14px] border border-ink-150 bg-surface flex overflow-hidden"
  >
    <!-- Empty state — no narrated sessions yet -->
    <div
      v-if="!hasData"
      class="flex-1 px-[20px] py-[22px] flex items-center gap-[10px] text-ink-500"
    >
      <IconClock :size="14" />
      <span class="eyebrow">Waiting for events</span>
    </div>

    <!-- Populated -->
    <template v-else>
      <div
        v-for="(m, i) in cells"
        :key="m.label"
        class="flex-1 min-w-0 px-[20px] py-[18px]"
        :class="i < cells.length - 1 ? 'border-r border-ink-100' : ''"
      >
        <div class="flex items-center gap-[8px] text-ink-500">
          <component :is="m.icon" :size="13" />
          <span class="eyebrow">{{ m.label }}</span>
        </div>
        <div
          class="mt-[10px] text-[15px] font-semibold text-ink-900 leading-[1.3] truncate"
          style="letter-spacing: -0.015em"
        >
          {{ m.value }}
        </div>
        <div class="mt-[4px] text-[12.5px] text-ink-500 truncate">
          {{ m.sub }}
        </div>
      </div>
    </template>
  </section>
</template>
