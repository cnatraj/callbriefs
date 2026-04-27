<script setup>
import { computed, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import HeroCTA from "@/components/dashboard/HeroCTA.vue";
import StatsRow from "@/components/dashboard/StatsRow.vue";
import OnboardingBanner from "@/components/dashboard/OnboardingBanner.vue";
import BriefsTable from "@/components/dashboard/BriefsTable.vue";

const auth = useAuthStore();
const showOnboarding = ref(true);

// Time-of-day buckets: 5–11 morning, 12–16 afternoon, otherwise evening.
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
});

const firstName = computed(() => {
  const meta = auth.user?.user_metadata;
  const name = meta?.full_name || meta?.name;
  if (name) return name.trim().split(/\s+/)[0];
  const email = auth.user?.email;
  if (email) return email.split("@")[0];
  return "";
});
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
          {{ greeting }}<template v-if="firstName">, {{ firstName }}</template>.
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
