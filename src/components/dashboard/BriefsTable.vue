<script setup>
import { ref } from "vue";
import { BRIEFS } from "@/data/briefs";
import StatusPill from "@/components/StatusPill.vue";
import { IconFilter, IconMore, IconArrowRight } from "@/components/icons";

const tab = ref("all");
const tabs = ["all", "mine", "shared with me", "archived"];
const cap = (t) => t[0].toUpperCase() + t.slice(1);

const GRID =
  "minmax(0,2fr) minmax(0,1.3fr) minmax(0,1.1fr) minmax(0,1.1fr) minmax(0,0.9fr) 40px";
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
        <span class="mono ml-[6px] text-[12px] text-ink-500">
          {{ BRIEFS.length }} of 284
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

    <!-- Rows -->
    <div
      v-for="b in BRIEFS"
      :key="b.id"
      class="grid items-center px-[18px] py-[14px] border-b border-ink-100 cursor-pointer hover:bg-ink-100 transition-colors"
      :style="{ gridTemplateColumns: GRID }"
    >
      <!-- Company -->
      <div class="flex items-center gap-3 min-w-0">
        <div
          class="w-8 h-8 grid place-items-center rounded-sm border border-ink-150 bg-ink-100 text-ink-700 mono font-semibold text-[11px]"
          style="letter-spacing: -0.01em"
        >
          {{ b.logo }}
        </div>
        <div class="min-w-0">
          <div class="font-medium text-ink-900">{{ b.company }}</div>
          <div class="mono text-[12px] text-ink-500">{{ b.id }}</div>
        </div>
      </div>

      <!-- Rep -->
      <div class="flex items-center gap-2">
        <div
          class="w-[22px] h-[22px] grid place-items-center rounded-full border border-ink-150 bg-ink-100 text-ink-700 text-[10px] font-semibold"
        >
          {{ b.rep.initials }}
        </div>
        <span class="text-ink-700">{{ b.rep.name }}</span>
      </div>

      <!-- Created -->
      <div class="text-ink-700">{{ b.created }}</div>

      <!-- Status -->
      <div>
        <StatusPill :status="b.status" :pct="b.pct" />
      </div>

      <!-- Views -->
      <div class="mono text-[12.5px] text-ink-500">
        {{ b.status === "draft" || b.status === "processing" ? "—" : b.views }}
      </div>

      <!-- Row action -->
      <div class="flex justify-end">
        <button class="text-ink-700 cursor-pointer bg-transparent border-0">
          <IconMore :size="15" />
        </button>
      </div>
    </div>
  </section>
</template>
