<script setup>
import { computed, ref, watch } from "vue";
import { IconCopy } from "@/components/icons";
import { useCallsStore } from "@/stores/calls";

const props = defineProps({
  slug: { type: String, default: null },
  prospectFirstName: { type: String, default: "" },
  prospectCompany: { type: String, default: "" },
});

const calls = useCallsStore();

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

const templates = computed(() => ({
  casual: {
    subject: `Quick recap from our chat`,
    body: `Hey ${props.prospectFirstName},

Thanks for the time today. I put together a quick brief covering what we discussed and a few next steps:

${publicUrl.value}

Have a look when you get a moment. Happy to jump back on if anything stands out.

${ownerFirstName.value}`,
  },
  formal: {
    subject: `Following up on our conversation`,
    body: `Hi ${props.prospectFirstName},

Thank you for the conversation today. I've prepared a personalized brief summarizing the priorities you raised and the next steps we discussed:

You can view it here: ${publicUrl.value}

Please review at your convenience. I'd be glad to schedule a follow-up to address any questions or feedback.

Best regards,
${ownerFirstName.value}${orgName.value ? `\n${orgName.value}` : ""}`,
  },
}));

const subject = ref(templates.value.casual.subject);
const body = ref(templates.value.casual.body);

const applyTemplate = () => {
  const t = templates.value[tone.value];
  subject.value = t.subject;
  body.value = t.body;
};

// Silent reset when tone switches; user edits are intentionally discarded.
watch(tone, applyTemplate);

const copied = ref(false);
let resetTimer = null;

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(
      `Subject: ${subject.value}\n\n${body.value}`,
    );
    copied.value = true;
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch (err) {
    console.error("[suggested-email] clipboard write failed:", err);
  }
};
</script>

<template>
  <section
    class="rounded-[14px] border border-ink-150 bg-surface px-[28px] py-[24px]"
  >
    <!-- Header strip: eyebrow + supporting copy on left, tone toggle on right -->
    <div class="flex items-start justify-between gap-[16px] mb-[18px]">
      <div class="flex-1 min-w-0">
        <div class="inline-flex items-center gap-[8px]">
          <span
            class="w-[6px] h-[6px] rounded-full"
            style="background: var(--accent)"
          />
          <span class="eyebrow text-ink-500">Suggested Next Move</span>
        </div>
        <p class="mt-[8px] text-[16px] leading-[1.5] text-ink-900">
          Send it to {{ prospectCompany }} while the call is still fresh.
        </p>
      </div>

      <!-- Tone toggle -->
      <div
        class="inline-flex p-[3px] rounded-lg bg-ink-100 border border-ink-150 shrink-0"
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
    </div>

    <!-- Subject -->
    <div class="flex flex-col gap-[6px] mb-[12px]">
      <label class="eyebrow text-ink-500" for="email-subject">Subject</label>
      <input
        id="email-subject"
        v-model="subject"
        type="text"
        class="px-[12px] py-[10px] rounded-[8px] bg-bg border border-ink-150 text-ink-900 outline-none focus:border-ink-300"
      />
    </div>

    <!-- Body -->
    <div class="flex flex-col gap-[6px] mb-[16px]">
      <label class="eyebrow text-ink-500" for="email-body">Body</label>
      <textarea
        id="email-body"
        v-model="body"
        rows="12"
        class="px-[12px] py-[10px] rounded-[8px] bg-bg border border-ink-150 text-ink-900 leading-[1.55] outline-none focus:border-ink-300 resize-y"
      ></textarea>
    </div>

    <div class="flex items-center justify-end">
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
  </section>
</template>
