<script setup>
import NavItem from "./NavItem.vue";
import {
  IconPlus,
  IconBriefs,
  IconKnowledge,
  IconUsers,
  IconSettings,
  IconChevronDown,
} from "./icons";
import { useNewBriefModal } from "@/composables/useNewBriefModal";

const { open } = useNewBriefModal();
</script>

<template>
  <aside
    class="flex flex-col gap-[2px] px-3 py-[14px] bg-nav-bg border-r border-ink-150"
  >
    <!-- Brand -->
    <div class="flex items-center gap-[9px] px-2 pt-[6px] pb-[14px]">
      <div
        class="w-[26px] h-[26px] rounded-sm bg-ink-900 text-bg grid place-items-center font-semibold text-[13px]"
        style="letter-spacing: -0.02em"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M4 8c3-4 13-4 16 0" />
          <path d="M7 13c2-2.5 8-2.5 10 0" />
          <path d="M10 18h4" />
        </svg>
      </div>
      <div class="text-[14.5px] font-semibold" style="letter-spacing: -0.015em">
        CallBriefs
      </div>
      <span
        class="mono ml-auto text-[10px] text-ink-500 px-[6px] py-[2px] border border-ink-150 rounded-xs bg-surface"
      >
        BETA
      </span>
    </div>

    <!-- Workspace switcher -->
    <div
      class="flex items-center justify-between px-2 py-[6px] mb-[6px] -mt-1 rounded-sm cursor-pointer hover:bg-nav-hover transition-colors"
    >
      <div>
        <div class="text-[12.5px] font-medium">Acme Sales · West</div>
        <div class="text-[12px] text-ink-500">12 seats · Business</div>
      </div>
      <IconChevronDown :size="14" class="text-ink-500" />
    </div>

    <!-- Primary CTA -->
    <button
      class="group my-1 mb-[14px] flex items-center justify-between gap-2 px-3 py-[10px] rounded-[9px] bg-accent hover:bg-accent-strong text-accent-ink border border-accent-strong font-semibold cursor-pointer shadow-cta transition-colors"
      style="letter-spacing: -0.01em"
      @click="open"
    >
      <span class="flex items-center gap-2">
        <IconPlus :size="16" :sw="2" />
        New Brief
      </span>
      <span
        class="mono text-[10.5px] px-[5px] py-[2px] rounded-xs"
        style="
          opacity: 0.6;
          border: 1px solid
            color-mix(in oklch, var(--accent-ink) 25%, transparent);
        "
      >
        N
      </span>
    </button>

    <!-- Core nav -->
    <NavItem to="/briefs" label="Briefs" count="284">
      <template #icon><IconBriefs :size="16" /></template>
    </NavItem>
    <NavItem to="/knowledge" label="Knowledge" count="36">
      <template #icon><IconKnowledge :size="16" /></template>
    </NavItem>
    <NavItem to="/users" label="Users" count="12">
      <template #icon><IconUsers :size="16" /></template>
    </NavItem>
    <NavItem to="/settings" label="Settings">
      <template #icon><IconSettings :size="16" /></template>
    </NavItem>

    <!-- Pinned -->
    <div class="eyebrow pt-[10px] pb-1 px-[10px]">Pinned</div>
    <NavItem label="Q2 Enterprise pipeline">
      <template #icon>
        <span class="inline-block w-2 h-2 rounded-sm bg-info" />
      </template>
    </NavItem>
    <NavItem label="RevOps playbook">
      <template #icon>
        <span class="inline-block w-2 h-2 rounded-sm bg-ok" />
      </template>
    </NavItem>

    <!-- Footer usage card -->
    <div class="mt-auto pt-2 border-t border-ink-150 flex flex-col gap-[2px]">
      <div
        class="my-2 mb-1 px-[11px] py-[10px] rounded-[8px] border border-ink-150 bg-surface"
      >
        <div class="flex justify-between text-[12px] text-ink-500 mb-[6px]">
          <span>Briefs this month</span>
          <span class="mono text-ink-700">47 / 100</span>
        </div>
        <div class="h-1 bg-ink-150 rounded overflow-hidden">
          <div class="h-full bg-ink-700" style="width: 47%"></div>
        </div>
        <div class="flex justify-between text-[12px] text-ink-500 mt-[6px]">
          <span>Resets May 1</span>
          <a class="text-ink-900 font-medium cursor-pointer">Upgrade →</a>
        </div>
      </div>
    </div>
  </aside>
</template>
