<script setup>
import { ref, computed } from "vue";
import { ARTIFACTS } from "@/data/artifacts";
import FileKindBadge from "./FileKindBadge.vue";
import StatusPill from "@/components/StatusPill.vue";
import {
  IconSearch,
  IconFilter,
  IconMore,
  IconList,
  IconGrid,
} from "@/components/icons";

const filter = ref("all");
const view = ref("list");

const FILTERS = [
  { key: "all", label: "All types" },
  { key: "pdf", label: "PDFs" },
  { key: "deck", label: "Decks" },
  { key: "video", label: "Video & audio" },
  { key: "doc", label: "Docs & sheets" },
];

const rows = computed(() =>
  ARTIFACTS.filter((a) => {
    if (filter.value === "all") return true;
    if (filter.value === "video")
      return a.kind === "video" || a.kind === "audio";
    if (filter.value === "doc") return a.kind === "doc" || a.kind === "sheet";
    return a.kind === filter.value;
  }),
);

const GRID =
  "36px minmax(0,2.4fr) minmax(0,1fr) minmax(0,1.2fr) minmax(0,0.9fr) minmax(0,1fr) 40px";

const initials = (name) =>
  name
    .split(" ")
    .map((s) => s[0])
    .join("");
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
        <div></div>
        <div>Artifact</div>
        <div>Tags</div>
        <div>Owner · Updated</div>
        <div>Used in</div>
        <div>Status</div>
        <div></div>
      </div>

      <!-- Rows -->
      <div
        v-for="a in rows"
        :key="a.id"
        class="grid items-center px-[18px] py-3 border-b border-ink-100 cursor-pointer hover:bg-ink-100 transition-colors"
        :style="{ gridTemplateColumns: GRID }"
      >
        <!-- Checkbox -->
        <div>
          <div
            class="w-4 h-4 rounded bg-surface"
            style="border: 1.5px solid var(--ink-200)"
          />
        </div>

        <!-- Artifact name -->
        <div class="flex items-center gap-3 min-w-0">
          <FileKindBadge :kind="a.kind" />
          <div class="min-w-0">
            <div class="font-medium text-ink-900 truncate">{{ a.name }}</div>
            <div class="flex gap-2 mt-[2px] text-[12px] text-ink-500">
              <span class="mono">{{ a.id }}</span>
              <span>·</span>
              <span>{{ a.size }}</span>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div class="flex flex-wrap gap-1">
          <span
            v-for="t in a.tags.slice(0, 2)"
            :key="t"
            class="mono text-[11px] px-[7px] py-[2px] rounded bg-ink-100 text-ink-700"
          >
            #{{ t }}
          </span>
        </div>

        <!-- Owner -->
        <div class="flex items-center gap-2 text-ink-700 min-w-0">
          <div
            class="w-[22px] h-[22px] grid place-items-center rounded-full border border-ink-150 bg-ink-100 text-ink-700 text-[10px] font-semibold"
          >
            {{ initials(a.owner) }}
          </div>
          <div class="min-w-0">
            <div class="font-medium text-ink-900 text-[13px]">
              {{ a.owner }}
            </div>
            <div class="text-[12px] text-ink-500">{{ a.updated }}</div>
          </div>
        </div>

        <!-- Usage -->
        <div class="flex items-center gap-2">
          <span class="mono text-[12px] text-ink-700 w-7">{{ a.usage }}</span>
          <div class="flex-1 h-1 bg-ink-100 rounded relative overflow-hidden">
            <div
              class="absolute inset-0 bg-ink-700"
              :style="{ width: `${Math.min(100, a.usage * 0.8)}%` }"
            />
          </div>
        </div>

        <!-- Status -->
        <div>
          <StatusPill :status="a.status" :pct="a.pct" />
        </div>

        <!-- Row action -->
        <div class="flex justify-end">
          <button class="text-ink-700 cursor-pointer bg-transparent border-0">
            <IconMore :size="15" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
