<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useCallsStore } from "@/stores/calls";
import { useOrgStore } from "@/stores/org";
import { useAuthStore } from "@/stores/auth";
import StatusPill from "@/components/StatusPill.vue";
import { IconFilter, IconMore, IconArrowRight } from "@/components/icons";

const router = useRouter();
const calls = useCallsStore();
const org = useOrgStore();
const auth = useAuthStore();

const tab = ref("all");
const tabs = ["all", "mine", "shared with me", "archived"];
const cap = (t) => t[0].toUpperCase() + t.slice(1);

const GRID =
  "minmax(0,2fr) minmax(0,1.3fr) minmax(0,1.1fr) minmax(0,1.1fr) minmax(0,0.9fr) 40px";

onMounted(() => {
  if (org.currentWorkspaceId) calls.loadList(org.currentWorkspaceId);
});

watch(
  () => org.currentWorkspaceId,
  (id) => {
    if (id) calls.loadList(id);
  },
);

const personInitials = (name) => {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const companyOf = (row) =>
  row.prospect_company ||
  row.microsites?.[0]?.content?.participants?.prospect?.company ||
  null;

const companyDisplay = (row) => companyOf(row) || "Untitled brief";

const companyInitials = (row) => {
  const c = companyOf(row);
  if (!c) return "—";
  const parts = c.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const repName = (row) => row.rep?.name || row.rep?.email || "Unknown";
const repInitials = (row) =>
  personInitials(row.rep?.name || row.rep?.email);

const formatCreated = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const isSameDay = d.toDateString() === now.toDateString();
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yest.toDateString();
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  if (isSameDay) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${time}`;
};

const filtered = computed(() => {
  const rows = calls.list;
  const me = auth.user?.id;
  if (tab.value === "mine") return rows.filter((r) => r.created_by === me);
  if (tab.value === "shared with me")
    return rows.filter((r) => r.created_by !== me);
  if (tab.value === "archived") return [];
  return rows;
});

const showInitialLoader = computed(
  () => calls.listLoading && calls.list.length === 0,
);

const goToBrief = (id) => router.push(`/briefs/${id}`);
</script>

<template>
  <section
    class="bg-surface border border-ink-150 rounded-[12px] overflow-hidden"
  >
    <!-- Head -->
    <div
      class="flex items-center gap-3 px-[18px] py-[14px] border-b border-ink-150"
    >
      <div class="flex items-baseline">
        <span class="text-[15px] font-semibold" style="letter-spacing: -0.01em">
          Recent briefs
        </span>
      </div>

      <div class="flex gap-[2px] ml-4 p-[2px] bg-ink-100 rounded-sm">
        <div
          v-for="t in tabs"
          :key="t"
          class="px-[10px] py-[4px] text-[12.5px] rounded-[5px] cursor-pointer"
          :class="
            tab === t
              ? 'bg-surface text-ink-900 font-medium shadow-tab'
              : 'text-ink-500'
          "
          @click="tab = t"
        >
          {{ cap(t) }}
        </div>
      </div>

      <div class="ml-auto flex gap-2">
        <button
          class="w-[30px] h-[30px] grid place-items-center rounded-sm border border-ink-150 bg-surface text-ink-700 cursor-pointer"
          title="Filter"
        >
          <IconFilter :size="14" />
        </button>
        <button
          class="w-[30px] h-[30px] grid place-items-center rounded-sm border border-ink-150 bg-surface text-ink-700 cursor-pointer"
          title="Sort"
        >
          <IconMore :size="14" />
        </button>
        <a
          class="inline-flex items-center gap-1 px-[10px] py-[6px] text-[12.5px] text-ink-900 font-medium rounded-sm cursor-pointer"
        >
          View all <IconArrowRight :size="12" />
        </a>
      </div>
    </div>

    <!-- Column header -->
    <div
      class="grid items-center px-[18px] py-[10px] bg-bg border-b border-ink-150 eyebrow"
      :style="{ gridTemplateColumns: GRID }"
    >
      <div>Company</div>
      <div>Rep</div>
      <div>Created</div>
      <div>Status</div>
      <div>Views</div>
      <div></div>
    </div>

    <!-- Loading -->
    <div
      v-if="showInitialLoader"
      class="px-[18px] py-[40px] text-center text-ink-500 text-[12.5px]"
    >
      Loading briefs…
    </div>

    <!-- Empty state -->
    <div
      v-else-if="filtered.length === 0"
      class="px-[18px] py-[40px] text-center"
    >
      <div class="text-ink-700 font-medium">
        {{
          tab === "archived"
            ? "No archived briefs"
            : tab === "mine"
              ? "You haven’t created any briefs yet"
              : tab === "shared with me"
                ? "No briefs from teammates yet"
                : "No briefs yet"
        }}
      </div>
      <div class="text-ink-500 text-[12.5px] mt-1">
        Create your first brief from the form above.
      </div>
    </div>

    <!-- Rows -->
    <div
      v-else
      v-for="b in filtered"
      :key="b.id"
      class="grid items-center px-[18px] py-[14px] border-b border-ink-100 cursor-pointer hover:bg-ink-100 transition-colors"
      :style="{ gridTemplateColumns: GRID }"
      @click="goToBrief(b.id)"
    >
      <!-- Company -->
      <div class="flex items-center gap-3 min-w-0">
        <div
          class="w-8 h-8 grid place-items-center rounded-sm border border-ink-150 bg-ink-100 text-ink-700 mono font-semibold text-[11px]"
          style="letter-spacing: -0.01em"
        >
          {{ companyInitials(b) }}
        </div>
        <div class="min-w-0">
          <div class="font-medium text-ink-900 truncate">
            {{ companyDisplay(b) }}
          </div>
          <div class="mono text-[12px] text-ink-500 truncate">
            {{ b.id.slice(0, 8) }}
          </div>
        </div>
      </div>

      <!-- Rep -->
      <div class="flex items-center gap-2 min-w-0">
        <div
          class="w-[22px] h-[22px] grid place-items-center rounded-full border border-ink-150 bg-ink-100 text-ink-700 text-[10px] font-semibold shrink-0"
        >
          {{ repInitials(b) }}
        </div>
        <span class="text-ink-700 truncate">{{ repName(b) }}</span>
      </div>

      <!-- Created -->
      <div class="text-ink-700">{{ formatCreated(b.created_at) }}</div>

      <!-- Status -->
      <div>
        <StatusPill :status="b.status" />
      </div>

      <!-- Views — placeholder until microsite_events lands -->
      <div class="mono text-[12.5px] text-ink-500">—</div>

      <!-- Row action -->
      <div class="flex justify-end">
        <button
          class="text-ink-700 cursor-pointer bg-transparent border-0"
          @click.stop
        >
          <IconMore :size="15" />
        </button>
      </div>
    </div>
  </section>
</template>
