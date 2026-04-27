<script setup>
import { computed, watch } from "vue";
import CollectionsRail from "@/components/knowledge/CollectionsRail.vue";
import UploadRow from "@/components/knowledge/UploadRow.vue";
import ArtifactsTable from "@/components/knowledge/ArtifactsTable.vue";
import { useOrgStore } from "@/stores/org";
import { useDocumentsStore } from "@/stores/documents";

const org = useOrgStore();
const documents = useDocumentsStore();

watch(
  () => org.currentWorkspaceId,
  (wsId) => {
    if (wsId) documents.loadDocuments(wsId);
    else documents.reset();
  },
  { immediate: true },
);

const totalBytes = computed(() =>
  documents.documents.reduce((sum, d) => sum + (d.file_size ?? 0), 0),
);

const formatSize = (bytes) => {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};
</script>

<template>
  <div class="max-w-[1240px] mx-auto" data-screen-label="Knowledge">
    <!-- <CollectionsRail /> -->

    <div class="flex flex-col gap-5 min-w-0">
      <div class="flex items-end justify-between gap-6">
        <div>
          <div
            class="text-[24px] font-semibold"
            style="letter-spacing: -0.025em"
          >
            Knowledge
          </div>
          <div class="text-ink-500 mt-1">
            Artifacts CallBriefs can pull from when drafting your briefs —
            pricing, decks, case studies, recordings.
          </div>
        </div>
        <div class="mono text-[12px] text-ink-500">
          {{ documents.documents.length }} artifact{{
            documents.documents.length === 1 ? "" : "s"
          }}
          · {{ formatSize(totalBytes) }}
        </div>
      </div>

      <UploadRow />
      <ArtifactsTable />
    </div>
  </div>
</template>
