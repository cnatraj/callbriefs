<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import WorkspaceStep from "@/components/onboarding/WorkspaceStep.vue";
import { useAuthStore } from "@/stores/auth";
import { useOrgStore } from "@/stores/org";

const router = useRouter();
const auth = useAuthStore();
const org = useOrgStore();

const STEPS = [
  {
    key: "workspace",
    label: "Set up your workspace",
    component: WorkspaceStep,
  },
];

const userEmail = computed(() => auth.user?.email ?? "");
const currentYear = new Date().getFullYear();

const index = ref(0);
const step = computed(() => STEPS[index.value]);
const totalSteps = STEPS.length;

const handleNext = async (payload) => {
  if (index.value < STEPS.length - 1) {
    index.value += 1;
    return;
  }
  const { error } = await org.completeOnboarding({
    orgName: payload?.company ?? "",
    orgDomain: payload?.website || null,
  });
  if (error) return;
  router.push("/briefs");
};

const signOut = async () => {
  await auth.signOut();
  router.push("/login");
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg" data-screen-label="Onboarding">
    <!-- Top bar -->
    <header class="flex items-center justify-between px-8 py-7">
      <div class="flex items-center gap-[10px]">
        <div
          class="w-[32px] h-[32px] rounded-[8px] bg-ink-900 text-bg grid place-items-center"
        >
          <svg
            width="17"
            height="17"
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
        <div
          class="text-[17px] font-semibold text-ink-900"
          style="letter-spacing: -0.015em"
        >
          CallBriefs
        </div>
        <span
          class="mono ml-[2px] text-[10px] text-ink-500 px-[6px] py-[2px] border border-ink-150 rounded-xs bg-surface"
        >
          BETA
        </span>
      </div>
      <div class="flex items-center gap-3 text-[13.5px]">
        <span class="text-ink-500">
          Signed in as
          <span class="text-ink-900 font-medium">{{ userEmail }}</span>
        </span>
        <button
          class="text-ink-900 font-semibold cursor-pointer bg-transparent border-0"
          @click="signOut"
        >
          Sign out
        </button>
      </div>
    </header>

    <!-- Centered step content -->
    <main class="flex-1 flex items-center justify-center px-6 py-10">
      <div class="w-full max-w-[440px] flex flex-col">
        <!-- Step pill -->
        <div
          class="self-start inline-flex items-center gap-[8px] mono text-[11px] uppercase text-ink-700 px-[12px] py-[6px] rounded-full mb-6"
          style="
            letter-spacing: 0.08em;
            background: color-mix(in oklch, var(--accent) 14%, var(--surface));
            border: 1px solid
              color-mix(in oklch, var(--accent) 35%, var(--ink-150) 65%);
          "
        >
          <span class="w-[7px] h-[7px] rounded-full bg-accent-strong" />
          Step {{ index + 1 }} of {{ totalSteps }} · {{ step.label }}
        </div>

        <component :is="step.component" @next="handleNext" />
      </div>
    </main>

    <!-- Footer -->
    <footer
      class="flex items-center justify-between px-8 py-6 text-[13px] text-ink-500"
    >
      <div>© {{ currentYear }} CallBriefs, Inc.</div>
      <div class="flex items-center gap-6">
        <a class="cursor-pointer hover:text-ink-900">Privacy</a>
        <a class="cursor-pointer hover:text-ink-900">Terms</a>
        <a class="cursor-pointer hover:text-ink-900">Support</a>
      </div>
    </footer>
  </div>
</template>
