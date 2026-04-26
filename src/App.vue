<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/components/AppShell.vue'
import NewBriefModal from '@/components/NewBriefModal.vue'
import CreateWorkspaceDrawer from '@/components/workspaces/CreateWorkspaceDrawer.vue'
import ArtifactDrawer from '@/components/knowledge/ArtifactDrawer.vue'
import PreviewDrawer from '@/components/brief/PreviewDrawer.vue'
import { useCallsStore } from '@/stores/calls'
import { pages } from '@/router'

const route = useRoute()
const calls = useCallsStore()
const page = computed(() => pages[route.name] || pages.briefs)
const isBareLayout = computed(() => !!route.meta?.layout)

// Brief detail breadcrumb leaf — populated once Detail.vue loads the call.
// Falls back to the microsite content's prospect company when prospect_company
// isn't denormalized onto the calls row yet.
const subCrumb = computed(() => {
  if (route.name !== 'brief-detail') return null
  const c = calls.activeCall
  if (!c) return null
  return (
    c.prospect_company ||
    c.microsites?.[0]?.content?.participants?.prospect?.company ||
    'Untitled brief'
  )
})
</script>

<template>
  <router-view v-if="isBareLayout" />
  <AppShell
    v-else
    :crumb="page.crumb"
    :sub-crumb="subCrumb"
    :search-placeholder="page.search"
  >
    <router-view />
  </AppShell>
  <NewBriefModal v-if="!isBareLayout" />
  <CreateWorkspaceDrawer v-if="!isBareLayout" />
  <ArtifactDrawer v-if="!isBareLayout" />
  <PreviewDrawer v-if="!isBareLayout" />
</template>
