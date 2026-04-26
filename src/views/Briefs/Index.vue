<script setup>
import { ref } from "vue";
import HeroCTA from "@/components/dashboard/HeroCTA.vue";
import StatsRow from "@/components/dashboard/StatsRow.vue";
import OnboardingBanner from "@/components/dashboard/OnboardingBanner.vue";
import BriefsTable from "@/components/dashboard/BriefsTable.vue";

const showOnboarding = ref(true);
</script>

<template>
  <div
    class="max-w-[1240px] mx-auto flex flex-col gap-6"
    data-screen-label="Dashboard"
  >
    <!-- Top row: greeting + meta -->
    <div class="flex items-end justify-between gap-6 mb-1">
      <div>
        <div
          class="text-[22px] font-semibold text-ink-900"
          style="letter-spacing: -0.02em"
        >
          Good afternoon, Ava.
        </div>
      </div>
      <div class="flex items-center gap-[14px] text-[12px] text-ink-500">
        <span class="mono">WED · APR 22</span>
        <span class="w-px h-[14px] bg-ink-150" />
        <span>Last synced 2 min ago</span>
      </div>
    </div>

    <OnboardingBanner v-if="showOnboarding" @dismiss="showOnboarding = false" />

    <HeroCTA />

    <!-- <StatsRow /> -->

    <BriefsTable />
  </div>
</template>
