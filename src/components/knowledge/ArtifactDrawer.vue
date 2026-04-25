<script setup>
import { computed } from "vue";
import AppDrawer from "@/components/AppDrawer.vue";
import FileKindBadge from "./FileKindBadge.vue";
import StatusPill from "@/components/StatusPill.vue";
import { IconArrowUpRight, IconSparkle } from "@/components/icons";
import { useArtifactDrawer } from "@/composables/useArtifactDrawer";
import { useDocumentsStore } from "@/stores/documents";
import { useCan } from "@/composables/useCan";
import { profileDisplayName, profileInitials } from "@/utils/profile";

const { isOpen, activeDoc, close } = useArtifactDrawer();
const documents = useDocumentsStore();
const can = useCan();

const MIME_TO_KIND = {
  "application/pdf": "pdf",
  "image/png": "image",
  "image/jpeg": "image",
  "image/webp": "image",
  "image/gif": "image",
};
const kindOf = (mime) => MIME_TO_KIND[mime] ?? "other";

const MIME_TO_LABEL = {
  "application/pdf": "PDF",
  "image/png": "PNG image",
  "image/jpeg": "JPEG image",
  "image/webp": "WEBP image",
  "image/gif": "GIF image",
};

const formatBytes = (bytes) => {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const formatLongDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const timeStr = `${d.getHours()}:${pad(d.getMinutes())}`;
  if (d.toDateString() === now.toDateString()) return `Today, ${timeStr}`;
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return `Yesterday, ${timeStr}`;
  const opts = { month: "short", day: "numeric" };
  if (d.getFullYear() !== now.getFullYear()) opts.year = "numeric";
  return d.toLocaleDateString("en-US", opts);
};

const shortId = (id) => (id ? id.slice(0, 8) : "");

const kind = computed(() =>
  activeDoc.value ? kindOf(activeDoc.value.mime_type) : "other",
);
const typeLabel = computed(
  () => MIME_TO_LABEL[activeDoc.value?.mime_type] ?? "Document",
);

// Pull fields out of extracted_content defensively — the shape is
// controlled by the user's extraction prompt, so keys may shift.
const summary = computed(
  () => activeDoc.value?.extracted_content?.summary ?? null,
);
const keyTopics = computed(() => {
  const t = activeDoc.value?.extracted_content?.key_topics;
  return Array.isArray(t) ? t : [];
});

const onOpenFile = () => documents.openSignedUrl(activeDoc.value);
const onDownload = () => documents.downloadDocument(activeDoc.value);

const onDelete = async () => {
  const doc = activeDoc.value;
  if (!doc) return;
  if (
    !window.confirm(
      `Delete "${doc.name}"? This removes the file and can't be undone.`,
    )
  )
    return;
  await documents.deleteDocument(doc);
  close();
};
</script>

<template>
  <AppDrawer :open="isOpen" width="520px" @close="close">
    <template v-if="activeDoc" #header>
      <div class="flex items-start gap-3">
        <FileKindBadge :kind="kind" />
        <div class="min-w-0 flex-1">
          <div
            class="font-semibold text-[17px] text-ink-900 leading-[1.25] break-words"
            style="letter-spacing: -0.015em"
          >
            {{ activeDoc.name }}

            <StatusPill :status="activeDoc.status" class="ml-2" />
          </div>
          <div
            class="flex items-center flex-wrap gap-x-2 gap-y-1 mt-[6px] text-[12.5px] text-ink-500 mono"
          >
            <span>{{ formatLongDate(activeDoc.created_at) }}</span>
            <span>·</span>
            <span>{{ formatBytes(activeDoc.file_size) }}</span>
          </div>
        </div>
      </div>
    </template>

    <template v-if="activeDoc">
      <div class="flex flex-col gap-6">
        <!-- Details -->
        <section>
          <div class="eyebrow mb-3">Details</div>
          <div
            class="grid items-center gap-y-[10px] text-[13px]"
            style="grid-template-columns: 110px 1fr"
          >
            <div class="text-ink-500">Owner</div>
            <div class="flex items-center gap-2 min-w-0 text-ink-900">
              <div
                class="w-[22px] h-[22px] grid place-items-center rounded-full border border-ink-150 bg-ink-100 text-ink-700 text-[10px] font-semibold shrink-0"
              >
                {{ profileInitials(activeDoc.uploader) }}
              </div>
              <span class="truncate">
                {{ profileDisplayName(activeDoc.uploader) ?? "—" }}
              </span>
            </div>
          </div>
        </section>

        <!-- AI Summary -->
        <section v-if="summary">
          <div class="flex items-center gap-2 mb-[10px]">
            <span
              class="inline-flex items-center gap-[4px] px-[7px] py-[2px] rounded-[5px] text-[10px] font-semibold text-accent-ink"
              style="
                letter-spacing: 0.04em;
                background: color-mix(in oklch, var(--accent) 22%, white 78%);
                border: 1px solid
                  color-mix(in oklch, var(--accent) 45%, var(--ink-150) 55%);
              "
            >
              <IconSparkle :size="10" :sw="2" />
              AI
            </span>
            <span class="eyebrow">Summary</span>
          </div>
          <div
            class="p-[14px] rounded-[10px] bg-nav-bg border border-ink-200 text-[13.5px] text-ink-700 leading-[1.55]"
          >
            {{ summary }}
          </div>
        </section>

        <!-- AI Key Topics -->
        <section v-if="keyTopics.length">
          <div class="flex items-center gap-2 mb-[10px]">
            <span
              class="inline-flex items-center gap-[4px] px-[7px] py-[2px] rounded-[5px] text-[10px] font-semibold text-accent-ink"
              style="
                letter-spacing: 0.04em;
                background: color-mix(in oklch, var(--accent) 22%, white 78%);
                border: 1px solid
                  color-mix(in oklch, var(--accent) 45%, var(--ink-150) 55%);
              "
            >
              <IconSparkle :size="10" :sw="2" />
              AI
            </span>
            <span class="eyebrow">Key topics</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="t in keyTopics"
              :key="t"
              class="mono text-[12px] text-ink-700 px-[9px] py-[4px] rounded-sm bg-ink-100 border border-ink-150"
            >
              {{ t }}
            </span>
          </div>
        </section>

        <!-- Status-specific empty/pending states for AI content -->
        <section
          v-if="
            !summary &&
            !keyTopics.length &&
            (activeDoc.status === 'uploaded' ||
              activeDoc.status === 'processing')
          "
          class="rounded-[10px] border border-dashed border-ink-200 p-4 text-center text-[13px] text-ink-500"
        >
          AI summary is being generated…
        </section>
        <section
          v-else-if="
            !summary && !keyTopics.length && activeDoc.status === 'failed'
          "
          class="rounded-[10px] border border-dashed border-ink-200 p-4 text-center text-[13px] text-ink-500"
        >
          Processing failed. The file is still available — re-uploading may
          help.
        </section>
      </div>
    </template>

    <template v-if="activeDoc" #footer>
      <div class="flex items-center justify-between gap-2">
        <div class="flex gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-[7px] px-[14px] h-[38px] rounded-[10px] bg-ink-900 text-bg border border-ink-900 text-[13px] font-semibold cursor-pointer shadow-cta-inset"
            style="letter-spacing: -0.005em"
            @click="onOpenFile"
          >
            <IconArrowUpRight :size="13" :sw="2" />
            Open file
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center px-[14px] h-[38px] rounded-[10px] bg-surface text-ink-900 border border-ink-200 text-[13px] font-medium cursor-pointer hover:bg-ink-100 transition-colors"
            @click="onDownload"
          >
            Download
          </button>
        </div>
        <button
          v-if="can('document.delete')"
          type="button"
          class="inline-flex items-center justify-center px-[14px] h-[38px] rounded-[10px] bg-surface text-danger text-[13px] font-medium cursor-pointer hover:bg-ink-100 transition-colors"
          style="
            border: 1px solid
              color-mix(in oklch, var(--danger) 30%, var(--ink-200) 70%);
          "
          @click="onDelete"
        >
          Remove
        </button>
      </div>
    </template>
  </AppDrawer>
</template>
