<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from "vue";
import FileKindBadge from "./FileKindBadge.vue";
import StatusPill from "@/components/StatusPill.vue";
import {
  IconSearch,
  IconFilter,
  IconMore,
  IconList,
  IconGrid,
} from "@/components/icons";
import { useDocumentsStore } from "@/stores/documents";
import { useCan } from "@/composables/useCan";

const documents = useDocumentsStore();
const can = useCan();

const openMenuId = ref(null);

const toggleMenu = (id) => {
  openMenuId.value = openMenuId.value === id ? null : id;
};
const closeMenu = () => (openMenuId.value = null);

const onDelete = async (doc) => {
  closeMenu();
  if (
    !window.confirm(
      `Delete "${doc.name}"? This removes the file and can't be undone.`,
    )
  )
    return;
  await documents.deleteDocument(doc);
};

const onDocClick = (e) => {
  if (!openMenuId.value) return;
  if (!e.target.closest?.("[data-row-menu]")) closeMenu();
};
const onEsc = (e) => {
  if (e.key === "Escape") closeMenu();
};

onMounted(() => {
  document.addEventListener("mousedown", onDocClick);
  document.addEventListener("keydown", onEsc);
});
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onDocClick);
  document.removeEventListener("keydown", onEsc);
});

const filter = ref("all");
const view = ref("list");

const FILTERS = [
  { key: "all", label: "All types" },
  { key: "pdf", label: "PDFs" },
  { key: "image", label: "Images" },
];

const MIME_TO_KIND = {
  "application/pdf": "pdf",
  "image/png": "image",
  "image/jpeg": "image",
  "image/webp": "image",
  "image/gif": "image",
};

const kindOf = (mime) => MIME_TO_KIND[mime] ?? "other";

const rows = computed(() => {
  const all = documents.documents.map((d) => ({ ...d, kind: kindOf(d.mime_type) }));
  if (filter.value === "all") return all;
  return all.filter((d) => d.kind === filter.value);
});

const formatBytes = (bytes) => {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const pad = (n) => String(n).padStart(2, "0");
const timeOf = (d) => `${d.getHours()}:${pad(d.getMinutes())}`;
const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return `Today, ${timeOf(d)}`;
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return `Yesterday, ${timeOf(d)}`;
  const opts = { month: "short", day: "numeric" };
  if (d.getFullYear() !== now.getFullYear()) opts.year = "numeric";
  return d.toLocaleDateString("en-US", opts);
};

const shortId = (id) => (id ? id.slice(0, 8) : "");

const GRID =
  "minmax(0,2.4fr) minmax(0,0.7fr) minmax(0,1fr) minmax(0,0.9fr) 40px";

const onRowClick = (doc) => documents.openSignedUrl(doc);
</script>

<template>
  <div class="flex flex-col gap-5 min-w-0">
    <!-- Toolbar -->
    <div
      class="flex items-center gap-[10px] px-[2px] py-[10px] border-b border-ink-150"
    >
      <div
        class="flex items-center gap-2 w-[280px] h-8 px-[10px] rounded-[8px] border border-ink-150 bg-surface text-[13px] text-ink-500"
      >
        <IconSearch :size="14" />
        <span class="flex-1">Search artifacts…</span>
      </div>

      <button
        v-for="f in FILTERS"
        :key="f.key"
        class="inline-flex items-center gap-[6px] px-[10px] py-[5px] rounded-full text-[12px] font-medium cursor-pointer"
        :class="
          filter === f.key
            ? 'bg-ink-900 text-bg border'
            : 'bg-surface text-ink-700 border border-ink-150'
        "
        :style="filter === f.key ? 'border-color: var(--ink-900);' : ''"
        @click="filter = f.key"
      >
        {{ f.label }}
      </button>

      <button
        class="inline-flex items-center gap-[6px] px-[10px] py-[5px] rounded-full text-[12px] font-medium cursor-pointer bg-surface text-ink-700 border border-ink-150"
      >
        <IconFilter :size="12" :sw="2" /> More
      </button>

      <div
        class="ml-auto flex gap-[2px] p-[2px] border border-ink-150 rounded-sm"
      >
        <button
          class="w-7 h-6 grid place-items-center rounded-[5px] cursor-pointer border-0"
          :class="
            view === 'list'
              ? 'bg-ink-100 text-ink-900'
              : 'text-ink-500 bg-transparent'
          "
          title="List"
          @click="view = 'list'"
        >
          <IconList :size="14" :sw="1.8" />
        </button>
        <button
          class="w-7 h-6 grid place-items-center rounded-[5px] cursor-pointer border-0"
          :class="
            view === 'grid'
              ? 'bg-ink-100 text-ink-900'
              : 'text-ink-500 bg-transparent'
          "
          title="Grid"
          @click="view = 'grid'"
        >
          <IconGrid :size="14" :sw="1.8" />
        </button>
      </div>
    </div>

    <!-- Table -->
    <div
      class="bg-surface border border-ink-150 rounded-[12px] overflow-hidden"
    >
      <!-- Column header -->
      <div
        class="grid items-center px-[18px] py-[10px] bg-bg border-b border-ink-150 eyebrow"
        :style="{ gridTemplateColumns: GRID }"
      >
        <div>Artifact</div>
        <div>Size</div>
        <div>Uploaded</div>
        <div>Status</div>
        <div></div>
      </div>

      <!-- Loading -->
      <div
        v-if="documents.loading && rows.length === 0"
        class="px-[18px] py-10 text-center text-[13px] text-ink-500"
      >
        Loading…
      </div>

      <!-- Empty -->
      <div
        v-else-if="rows.length === 0"
        class="px-[18px] py-10 text-center text-[13px] text-ink-500"
      >
        {{
          filter === "all"
            ? "No artifacts in this workspace yet. Drop a file above to get started."
            : "No artifacts match that filter."
        }}
      </div>

      <!-- Rows -->
      <div
        v-for="d in rows"
        :key="d.id"
        class="grid items-center px-[18px] py-3 border-b border-ink-100 cursor-pointer hover:bg-ink-100 transition-colors"
        :style="{ gridTemplateColumns: GRID }"
        @click="onRowClick(d)"
      >
        <!-- Artifact name -->
        <div class="flex items-center gap-3 min-w-0">
          <FileKindBadge :kind="d.kind" />
          <div class="min-w-0">
            <div class="font-medium text-ink-900 truncate">{{ d.name }}</div>
            <div class="mono text-[12px] text-ink-500 mt-[2px]">
              {{ shortId(d.id) }}
            </div>
          </div>
        </div>

        <!-- Size -->
        <div class="mono text-[12.5px] text-ink-700">
          {{ formatBytes(d.file_size) }}
        </div>

        <!-- Uploaded -->
        <div class="text-ink-700 text-[13px]">{{ formatDate(d.created_at) }}</div>

        <!-- Status -->
        <div>
          <StatusPill :status="d.status" />
        </div>

        <!-- Row action -->
        <div class="flex justify-end relative" data-row-menu>
          <button
            v-if="can('document.delete')"
            class="text-ink-700 cursor-pointer bg-transparent border-0 p-1 rounded-[5px] hover:bg-ink-100"
            @click.stop="toggleMenu(d.id)"
          >
            <IconMore :size="15" />
          </button>
          <div
            v-if="openMenuId === d.id"
            class="absolute right-0 top-full mt-1 w-[160px] bg-surface border border-ink-150 rounded-[10px] shadow-panel py-1 z-10"
            role="menu"
          >
            <button
              role="menuitem"
              class="w-full text-left px-3 py-[8px] text-[13px] text-danger hover:bg-ink-100 bg-transparent border-0 cursor-pointer"
              @click.stop="onDelete(d)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
