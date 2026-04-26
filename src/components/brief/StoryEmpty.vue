<script setup>
import { computed, ref } from "vue";
import { IconDoc, IconCopy, IconMail } from "@/components/icons";

const props = defineProps({
  slug: { type: String, default: null },
  prospectFirstName: { type: String, default: "Maya" },
  prospectCompany: { type: String, default: "Acuity Robotics" },
});

const publicUrl = computed(() => {
  if (!props.slug) return "";
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/m/${props.slug}`;
});

const copied = ref(false);
let resetTimer = null;

const handleCopy = async () => {
  if (!publicUrl.value) return;
  try {
    await navigator.clipboard.writeText(publicUrl.value);
    copied.value = true;
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch (err) {
    console.error("[story-empty] clipboard write failed:", err);
  }
};

const handleSend = () => {
  // Placeholder — wire to mailto / share once the channel field exists.
};
</script>

<template>
  <section
    class="rounded-[14px] border border-ink-150 bg-surface overflow-hidden"
  >
    <!-- White: waiting / explainer -->
    <div class="px-[28px] py-[28px]">
      <div class="flex items-start gap-[16px]">
        <span
          class="w-[44px] h-[44px] rounded-[10px] grid place-items-center bg-ink-100 text-ink-500 shrink-0"
        >
          <IconDoc :size="20" />
        </span>

        <div class="flex-1 min-w-0">
          <div class="eyebrow text-ink-500">
            The Story · Waiting for first view
          </div>

          <p class="mt-[14px] text-[16px] leading-[1.6] text-ink-900">
            Your microsite for
            <span class="font-semibold">{{ prospectCompany }}</span> is live and
            the link is ready to be shared. To get started, copy the link above
            and paste it into an email to Kathi.
          </p>
          <p class="mt-[14px] text-[16px] leading-[1.6] text-ink-900">
            <span class="text-ink-500">
              The moment they open it, you'll see which sections they actually
              read, which they skimmed, and whether they came back —
            </span>

            <span
              class="px-[4px] py-[1px] rounded-[3px]"
              style="
                background: color-mix(in oklch, var(--accent) 32%, white 68%);
              "
            >
              so you always know the right time to follow up.
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- Dark: next-step action footer (edge-to-edge inside the card) -->
    <div
      class="px-[28px] py-[22px] flex items-center gap-[100px]"
      style="background: var(--ink-900)"
    >
      <div class="flex-1 min-w-0 flex flex-col gap-[10px]">
        <div class="inline-flex items-center gap-[8px]">
          <span
            class="w-[6px] h-[6px] rounded-full"
            style="background: var(--accent)"
          />
          <span
            class="text-[11px] font-medium uppercase"
            style="
              letter-spacing: 0.06em;
              color: color-mix(in oklch, var(--bg) 55%, transparent);
            "
          >
            Suggested Next Move
          </span>
        </div>
        <p class="text-[19px] leading-[1.55]" style="color: var(--bg)">
          Your story is ready. Send it to {{ prospectCompany }} while the call
          is still fresh.
        </p>

        <p class="text-[15px] leading-[1.55] text-ink-300">
          The best follow-ups occur within 2 to 4 hours after the call. The
          story will start writing itself the moment they open it.
        </p>
      </div>

      <div class="flex items-center gap-[10px] shrink-0">
        <button
          type="button"
          :disabled="!publicUrl"
          class="dark-btn inline-flex items-center gap-[6px] px-[14px] py-[8px] rounded-[8px] border text-[12.5px] font-medium cursor-pointer disabled:cursor-not-allowed"
          @click="handleCopy"
        >
          <IconCopy :size="13" />
          {{ copied ? "Copied" : "Copy link" }}
        </button>

        <button
          type="button"
          class="dark-btn inline-flex items-center gap-[6px] px-[14px] py-[8px] rounded-[8px] border text-[12.5px] font-medium cursor-pointer"
          @click="handleSend"
        >
          <IconMail :size="13" />
          Email {{ prospectFirstName }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dark-btn {
  border-color: color-mix(in oklch, var(--bg) 18%, transparent);
  color: var(--bg);
  background: transparent;
  transition: background 150ms ease;
}
.dark-btn:hover:not(:disabled) {
  background: color-mix(in oklch, var(--bg) 6%, transparent);
}
.dark-btn:disabled {
  opacity: 0.5;
}
</style>
