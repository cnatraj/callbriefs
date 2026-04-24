<script setup>
import CollectionsRail from "@/components/knowledge/CollectionsRail.vue";
import UploadRow from "@/components/knowledge/UploadRow.vue";
import ArtifactsTable from "@/components/knowledge/ArtifactsTable.vue";
</script>

<template>
  <div
    class="max-w-[1320px] mx-auto grid gap-7 items-start"
    style="grid-template-columns: 220px 1fr"
    data-screen-label="Knowledge"
  >
    <CollectionsRail />

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
          186 artifacts · 1.7 GB of 10 GB used
        </div>
      </div>

      <UploadRow />
      <ArtifactsTable />
    </div>
  </div>
</template>
