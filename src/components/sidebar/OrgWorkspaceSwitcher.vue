<script setup>
import { ref, onBeforeUnmount, onMounted } from "vue";
import { useOrgStore } from "@/stores/org";
import {
  IconCheck,
  IconPlus,
  IconSettings,
  IconChevronUpDown,
} from "@/components/icons";
import { useCreateWorkspaceDrawer } from "@/composables/useCreateWorkspaceDrawer";
import { useCan } from "@/composables/useCan";

const org = useOrgStore();
const createDrawer = useCreateWorkspaceDrawer();
const can = useCan();

const open = ref(false);
const rootRef = ref(null);

const orgInitials = (name) => (name?.trim()?.[0] ?? "?").toUpperCase();

const workspaceInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const PALETTE = [
  "oklch(62% 0.16 240)",
  "oklch(62% 0.18 25)",
  "oklch(60% 0.15 150)",
  "oklch(60% 0.20 310)",
  "oklch(60% 0.18 55)",
];

const colorForId = (id) => {
  if (!id) return PALETTE[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

const TYPE_LABEL = {
  sales: "Sales",
  onboarding: "Onboarding",
  customer_service: "Customer service",
};

const toggle = () => (open.value = !open.value);
const close = () => (open.value = false);

const onWorkspaceClick = (wsId) => {
  org.switchWorkspace(wsId);
  close();
};

const onClickOutside = (e) => {
  if (!open.value) return;
  if (rootRef.value && !rootRef.value.contains(e.target)) close();
};
const onEsc = (e) => {
  if (e.key === "Escape") close();
};

onMounted(() => {
  document.addEventListener("mousedown", onClickOutside);
  document.addEventListener("keydown", onEsc);
});
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onClickOutside);
  document.removeEventListener("keydown", onEsc);
});
</script>

<template>
  <div ref="rootRef" class="relative">
    <!-- Closed card: org + current workspace -->
    <div
      class="bg-surface border border-ink-150 rounded-[10px] overflow-hidden"
    >
      <!-- Org row -->
      <div class="flex items-center gap-[10px] px-[11px] py-[10px]">
        <div
          class="w-[26px] h-[26px] rounded-[6px] bg-ink-900 text-bg grid place-items-center font-semibold text-[12px]"
          style="letter-spacing: -0.02em"
        >
          {{ orgInitials(org.currentOrg?.name) }}
        </div>
        <div class="font-medium truncate min-w-0 flex-1">
          {{ org.currentOrg?.name ?? "—" }}
        </div>
        <span
          class="mono text-[9.5px] text-ink-500 px-[6px] py-[2px] border border-ink-150 rounded-xs bg-bg"
          style="letter-spacing: 0.08em"
        >
          ORG
        </span>
      </div>

      <!-- Dashed divider -->
      <div class="mx-[11px]" style="border-top: 1px dashed var(--ink-150)" />

      <!-- Workspace row -->
      <button
        class="w-full flex items-center gap-[10px] px-[11px] py-[10px] bg-transparent border-0 cursor-pointer text-left hover:bg-nav-hover transition-colors"
        :aria-expanded="open"
        aria-haspopup="menu"
        @click="toggle"
      >
        <div
          class="w-[26px] h-[26px] rounded-[6px] text-bg grid place-items-center font-semibold text-[11px] shrink-0"
          :style="{ background: colorForId(org.currentWorkspace?.id) }"
        >
          {{ workspaceInitials(org.currentWorkspace?.name) }}
        </div>
        <div class="min-w-0 flex-1">
          <div
            class="text-[9.5px] text-ink-500 uppercase leading-none"
            style="letter-spacing: 0.08em"
          >
            Workspace
          </div>
          <div class="text-[13.5px] font-medium truncate mt-[3px]">
            {{ org.currentWorkspace?.name ?? "—" }}
          </div>
        </div>
        <IconChevronUpDown :size="14" class="text-ink-400 shrink-0" />
      </button>
    </div>

    <!-- Open picker -->
    <div
      v-if="open"
      class="absolute left-0 right-0 top-0 z-20 bg-surface border border-ink-150 rounded-[10px] overflow-hidden shadow-panel"
      role="menu"
    >
      <!-- Org header (two-line) -->
      <div
        class="flex items-center gap-[10px] px-[11px] py-[10px] border-b border-ink-100"
      >
        <div
          class="w-[26px] h-[26px] rounded-[6px] bg-ink-900 text-bg grid place-items-center font-semibold text-[12px]"
          style="letter-spacing: -0.02em"
        >
          {{ orgInitials(org.currentOrg?.name) }}
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-medium truncate">
            {{ org.currentOrg?.name ?? "—" }}
          </div>
          <div
            class="text-[10px] text-ink-500 uppercase mt-[1px]"
            style="letter-spacing: 0.08em"
          >
            Organization
          </div>
        </div>
      </div>

      <!-- Switch workspace eyebrow -->
      <div class="eyebrow px-3 pt-3 pb-1">Switch workspace</div>

      <!-- Workspace list -->
      <div class="flex flex-col pb-1">
        <button
          v-for="ws in org.workspaces"
          :key="ws.id"
          class="flex items-center gap-3 px-3 py-[8px] bg-transparent border-0 cursor-pointer text-left transition-colors"
          :class="
            ws.id === org.currentWorkspaceId ? 'bg-ink-100' : 'hover:bg-ink-100'
          "
          @click="onWorkspaceClick(ws.id)"
        >
          <div
            class="w-[32px] h-[32px] rounded-[6px] text-bg grid place-items-center font-semibold text-[12px] shrink-0"
            :style="{ background: colorForId(ws.id) }"
          >
            {{ workspaceInitials(ws.name) }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-[13.5px] font-medium truncate">{{ ws.name }}</div>
            <div class="text-[11.5px] text-ink-500 truncate">
              {{ TYPE_LABEL[ws.type] ?? ws.type }}
            </div>
          </div>
          <IconCheck
            v-if="ws.id === org.currentWorkspaceId"
            :size="13"
            :sw="2.2"
            class="text-ink-900 shrink-0"
          />
        </button>
      </div>

      <!-- Footer actions -->
      <div class="border-t border-ink-100">
        <button
          v-if="can('workspace.create')"
          class="w-full flex items-center gap-[10px] px-3 py-[10px] bg-transparent border-0 cursor-pointer text-left text-[13.5px] text-ink-900 hover:bg-ink-100 transition-colors"
          @click="close(); createDrawer.open()"
        >
          <span
            class="w-[26px] h-[26px] rounded-[6px] grid place-items-center text-ink-500 shrink-0"
            style="border: 1px dashed var(--ink-300)"
          >
            <IconPlus :size="13" :sw="1.8" />
          </span>
          Create new workspace
        </button>
        <button
          class="w-full flex items-center gap-[10px] px-3 py-[10px] bg-transparent border-0 cursor-pointer text-left text-[13.5px] text-ink-900 hover:bg-ink-100 transition-colors"
          @click="close"
        >
          <span
            class="w-[26px] h-[26px] rounded-[6px] grid place-items-center text-ink-500 shrink-0"
            style="border: 1px dashed var(--ink-300)"
          >
            <IconSettings :size="13" :sw="1.8" />
          </span>
          Workspace settings
        </button>
      </div>
    </div>
  </div>
</template>
