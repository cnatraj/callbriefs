<script setup>
import { computed, ref, watch, onMounted } from "vue";
import StorySessionCard from "./StorySessionCard.vue";
import MicrositeMetrics from "./MicrositeMetrics.vue";
import SignalsPreview from "./SignalsPreview.vue";
import { IconClock } from "@/components/icons";
import { getSessionNarrativesForMicrosite } from "@/services/sessionNarratives";

const props = defineProps({
  micrositeId: { type: String, default: null },
  prospectFirstName: { type: String, default: "your prospect" },
});

const rows = ref([]);
const loading = ref(false);
const error = ref(null);

const load = async (id) => {
  if (!id) {
    rows.value = [];
    return;
  }
  loading.value = true;
  error.value = null;
  const { data, error: err } = await getSessionNarrativesForMicrosite(id);
  if (err) {
    error.value = err.message;
    rows.value = [];
  } else {
    rows.value = data ?? [];
  }
  loading.value = false;
};

onMounted(() => load(props.micrositeId));
watch(
  () => props.micrositeId,
  (id) => load(id),
);

// Compute visit_number per fingerprint by walking ascending order, then
// shape each row into the props StorySessionCard expects.
const sessions = computed(() => {
  if (!rows.value.length) return [];

  const ascending = [...rows.value].sort(
    (a, b) => new Date(a.generated_at) - new Date(b.generated_at),
  );
  const visitByRowId = new Map();
  const counts = new Map();
  for (const r of ascending) {
    const n = (counts.get(r.fingerprint_id) ?? 0) + 1;
    counts.set(r.fingerprint_id, n);
    visitByRowId.set(r.id, n);
  }

  return rows.value.map((r) => toCardData(r, visitByRowId.get(r.id)));
});

const SIGNAL_LABELS = {
  returning_visitor: { label: "Returning visitor", icon: "returning" },
  forwarded: { label: "Forwarded link", icon: "forwarded" },
  cta_clicked: { label: "CTA clicked", icon: "buying" },
  first_view: { label: "First view", icon: "buying" },
  no_engagement: { label: "Quick glance", icon: "mobile" },
};

const titleCase = (s) =>
  s
    ?.toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

const mapBestSignal = (key) =>
  SIGNAL_LABELS[key] ?? { label: titleCase(key), icon: "buying" };

const formatDateLabel = (date) => {
  const now = new Date();
  const d = new Date(date);
  if (d.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays < 7) return d.toLocaleDateString("en-US", { weekday: "long" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatTimeLabel = (date) =>
  new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const formatDeviceLabel = (type) => {
  if (!type || type === "unknown") return "unknown device";
  return type;
};

const formatDuration = (ms) => {
  if (typeof ms !== "number" || ms < 0) return null;
  const totalSec = Math.round(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return sec === 0 ? `${min}m` : `${min}m ${sec}s`;
};

const toCardData = (row, visitNumber) => {
  const signals = row.signals ?? {};
  const isReturning = visitNumber > 1;

  let status = "first_view";
  if (signals.forwarded) status = "forwarded";
  else if (isReturning) status = "returning";

  const viewerLabel = isReturning
    ? `Visit ${visitNumber}`
    : signals.forwarded
      ? "Forwarded viewer"
      : "New viewer";

  return {
    id: row.session_id?.slice(0, 8) ?? row.id?.slice(0, 8),
    date_label: formatDateLabel(row.generated_at),
    time_label: formatTimeLabel(row.generated_at),
    status,
    is_active: false,
    is_still_reading: false,
    viewer_label: viewerLabel,
    device: {
      type: signals.device_type ?? "unknown",
      label: formatDeviceLabel(signals.device_type),
    },
    narrative: row.narrative ?? "",
    sections_reached: null,
    sections_total: null,
    best_signal: signals.best_signal
      ? mapBestSignal(signals.best_signal)
      : null,
    detail_pills: buildDetailPills(signals),
  };
};

const buildDetailPills = (signals) => {
  const pills = [];
  const duration = formatDuration(signals.time_spent_ms);
  if (duration)
    pills.push({ label: `Time on site: ${duration}`, icon: IconClock });
  return pills;
};
</script>

<template>
  <section class="flex flex-col gap-[20px]">
    <MicrositeMetrics v-if="sessions.length" :narratives="rows" />

    <div v-if="sessions.length" class="flex flex-col gap-[14px]">
      <header class="flex items-baseline justify-between">
        <span class="eyebrow text-ink-500">Sessions</span>
        <span class="mono text-[10.5px] text-ink-500">
          {{ sessions.length }} · newest first
        </span>
      </header>

      <div class="flex flex-col gap-[16px]">
        <div
          v-for="(session, idx) in sessions"
          :key="session.id"
          class="flex gap-[14px]"
        >
          <!-- Timeline column: dot + connecting line -->
          <div class="relative shrink-0 w-[10px] flex flex-col items-center">
            <span
              class="w-[10px] h-[10px] rounded-full mt-[22px] shrink-0 z-[1]"
              :style="
                session.is_active
                  ? 'background: var(--accent); box-shadow: 0 0 0 2px color-mix(in oklch, var(--accent) 30%, transparent);'
                  : 'background: var(--ink-700);'
              "
            />
            <span
              v-if="idx < sessions.length - 1"
              class="absolute left-1/2 -translate-x-1/2 top-[36px] bottom-[-16px] w-px bg-ink-200"
            />
          </div>

          <StorySessionCard :session="session" class="flex-1" />
        </div>
      </div>
    </div>

    <SignalsPreview v-else :prospect-first-name="prospectFirstName" />
  </section>
</template>
