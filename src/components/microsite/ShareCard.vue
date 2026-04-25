<script setup>
import { ref, computed } from "vue";
import { IconLink, IconCopy } from "@/components/icons";

const props = defineProps({
  company: { type: String, default: null },
});

// Always reflect the page's actual URL — works on prod, dev, and demo route.
const url = computed(() =>
  typeof window === "undefined" ? "" : window.location.href,
);

const copied = ref(false);
let resetTimer = null;

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(url.value);
    copied.value = true;
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch (err) {
    console.error("[share] clipboard write failed:", err);
  }
};
</script>

<template>
  <section
    class="px-[18px] py-[18px] rounded-[14px] bg-nav-bg border border-ink-100"
  >
    <div class="flex items-start gap-[12px]">
      <div
        class="shrink-0 w-[34px] h-[34px] grid place-items-center rounded-[10px] bg-surface border border-ink-150 text-ink-700"
      >
        <IconLink :size="16" />
      </div>
      <div class="min-w-0 flex-1">
        <div
          class="text-[15px] font-semibold text-ink-900 leading-[1.3]"
          style="letter-spacing: -0.01em"
        >
          Share this brief with your team
        </div>
        <p class="text-[13.5px] text-ink-500 leading-[1.5] mt-[4px] mb-0">
          Forward this brief to your team at
          {{ company ?? "your prospect" }}.
        </p>
      </div>
    </div>

    <div
      class="mt-[14px] flex items-center gap-[6px] p-[6px] rounded-[10px] bg-surface border border-ink-150"
    >
      <div
        class="flex-1 min-w-0 px-[10px] mono text-[12.5px] text-ink-700 truncate"
      >
        {{ url }}
      </div>
      <button
        type="button"
        class="shrink-0 inline-flex items-center gap-[6px] px-[12px] py-[8px] rounded-[8px] bg-ink-900 text-bg text-[12.5px] font-semibold cursor-pointer border-0 transition-colors"
        :style="copied ? 'background: var(--ok);' : ''"
        @click="handleCopy"
      >
        <IconCopy :size="13" />
        {{ copied ? "Copied" : "Copy" }}
      </button>
    </div>
  </section>
</template>
