<script setup>
// SuggestedEmailCopy — citron-tinted collapsible footer strip inside the
// OverallStory card. The collapsed header carries an eyebrow + short
// call-to-action ("Reach out today, lead with security"). When expanded,
// the body shows a draftable email (subject, body, tone toggle, copy)
// the rep can fire off while the call is fresh.

import { computed, ref, watch } from "vue";
import { IconChevronDown, IconCopy, IconLink } from "@/components/icons";
import { useCallsStore } from "@/stores/calls";

const props = defineProps({
  slug: { type: String, default: null },
  prospectFirstName: { type: String, default: "" },
  prospectCompany: { type: String, default: "" },
});

const calls = useCallsStore();

// Default to collapsed — the email is the primary action on this surface.
const isOpen = ref(false);

// Toggle the expanded/collapsed state.
const toggle = () => {
  isOpen.value = !isOpen.value;
};

// Pull just the first token from a full name string.
const firstName = (full) => (full ?? "").trim().split(/\s+/)[0] || "";

const ownerFirstName = computed(
  () => firstName(calls.microsite?.content?.brief_owner?.name) || "",
);
const orgName = computed(() => calls.microsite?.content?.org?.name || "");

const publicUrl = computed(() => {
  if (!props.slug || typeof window === "undefined") return "";
  return `${window.location.origin}/m/${props.slug}`;
});

const tone = ref("casual");

// Two pre-baked drafts keyed by tone. Subject + body are merged into a
// single string with a "Subject:" header line so the rep edits one
// surface. Recomputes whenever any input changes so the editor
// reflects the latest props/owner.
const templates = computed(() => ({
  casual: `Subject: Quick recap from our chat

Hey ${props.prospectFirstName},

Thanks for the time today. I put together a quick brief covering what we discussed and a few next steps:

${publicUrl.value}

Have a look when you get a moment. Happy to jump back on if anything stands out.

${ownerFirstName.value}`,
  formal: `Subject: Following up on our conversation

Hi ${props.prospectFirstName},

Thank you for the conversation today. I've prepared a personalized brief summarizing the priorities you raised and the next steps we discussed:

You can view it here: ${publicUrl.value}

Please review at your convenience. I'd be glad to schedule a follow-up to address any questions or feedback.

Best regards,
${ownerFirstName.value}${orgName.value ? `\n${orgName.value}` : ""}`,
}));

const emailText = ref(templates.value.casual);

// Reset the email textarea to the active tone's template.
const applyTemplate = () => {
  emailText.value = templates.value[tone.value];
};

// Silent reset when tone switches; user edits are intentionally discarded.
watch(tone, applyTemplate);

const copied = ref(false);
let resetTimer = null;

// Copy the entire email (subject + body) to the clipboard, flash "Copied".
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(emailText.value);
    copied.value = true;
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch (err) {
    console.error("[suggested-email-copy] clipboard write failed:", err);
  }
};

const linkCopied = ref(false);
let linkResetTimer = null;

// Copy just the public microsite URL to the clipboard.
const handleCopyLink = async () => {
  if (!publicUrl.value) return;
  try {
    await navigator.clipboard.writeText(publicUrl.value);
    linkCopied.value = true;
    if (linkResetTimer) clearTimeout(linkResetTimer);
    linkResetTimer = setTimeout(() => {
      linkCopied.value = false;
    }, 1500);
  } catch (err) {
    console.error("[suggested-email-copy] link copy failed:", err);
  }
};
</script>

<template>
  <div
    class="-mx-[28px] -mb-[28px] mt-[24px] border-t border-ink-150"
    style="background: color-mix(in oklch, var(--accent) 18%, white 82%)"
  >
    <button
      type="button"
      class="w-full flex items-center gap-[12px] px-[28px] py-[14px] bg-transparent border-0 cursor-pointer text-left text-ink-900"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <span class="w-[8px] h-[8px] rounded-full bg-accent-strong shrink-0" />
      <span class="eyebrow text-ink-900">SEND YOUR BRIEF</span>
      <span class="text-ink-500">·</span>
      <span class="flex-1 text-[13.5px] text-ink-500">
        Copy-paste email ready to go
      </span>
      <span
        class="text-ink-700 shrink-0"
        :style="`transition: transform 150ms ease; transform: rotate(${isOpen ? 180 : 0}deg);`"
      >
        <IconChevronDown :size="16" />
      </span>
    </button>

    <div v-if="isOpen" class="px-[28px] pb-[20px] pt-[6px]">
      <!-- Email (subject + body in a single editor) -->
      <div class="flex flex-col gap-[6px] mb-[16px]">
        <label class="eyebrow text-ink-500" for="snm-email">Email</label>
        <textarea
          id="snm-email"
          v-model="emailText"
          rows="14"
          class="px-[12px] py-[10px] rounded-[8px] bg-surface border border-ink-150 text-ink-900 leading-[1.55] outline-none focus:border-ink-300 resize-y"
        ></textarea>
      </div>

      <!-- Footer row: tone toggle on left, action buttons on right -->
      <div class="flex items-center justify-between gap-[12px]">
        <div
          class="inline-flex p-[3px] rounded-lg bg-ink-100 border border-ink-150"
        >
          <button
            type="button"
            class="px-[14px] py-[6px] rounded-md text-[12.5px] font-medium cursor-pointer transition-colors"
            :class="
              tone === 'casual'
                ? 'bg-surface text-ink-900 border border-ink-150'
                : 'text-ink-500 border border-transparent hover:text-ink-700'
            "
            @click="tone = 'casual'"
          >
            Short &amp; Casual
          </button>
          <button
            type="button"
            class="px-[14px] py-[6px] rounded-md text-[12.5px] font-medium cursor-pointer transition-colors"
            :class="
              tone === 'formal'
                ? 'bg-surface text-ink-900 border border-ink-150'
                : 'text-ink-500 border border-transparent hover:text-ink-700'
            "
            @click="tone = 'formal'"
          >
            Formal
          </button>
        </div>

        <div class="flex items-center gap-[8px]">
          <button
            type="button"
            :disabled="!publicUrl"
            class="inline-flex items-center gap-[8px] px-[14px] py-[9px] rounded-[9px] font-medium cursor-pointer bg-surface border border-ink-200 text-ink-900 hover:bg-ink-100 transition-colors disabled:cursor-not-allowed disabled:text-ink-400"
            @click="handleCopyLink"
          >
            <IconLink :size="14" />
            {{ linkCopied ? "Copied" : "Copy link to microsite" }}
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-[8px] px-[14px] py-[9px] rounded-[9px] font-medium cursor-pointer"
            style="
              background: var(--accent);
              color: var(--accent-ink);
              border: 1px solid var(--accent-strong);
              box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
            "
            @click="handleCopy"
          >
            <IconCopy :size="14" />
            {{ copied ? "Copied" : "Copy email" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
