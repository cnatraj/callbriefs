<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/components/AppShell.vue'
import NewBriefModal from '@/components/NewBriefModal.vue'
import CreateWorkspaceDrawer from '@/components/workspaces/CreateWorkspaceDrawer.vue'
import ArtifactDrawer from '@/components/knowledge/ArtifactDrawer.vue'
import { pages } from '@/router'

const route = useRoute()
const page = computed(() => pages[route.name] || pages.briefs)
const isBareLayout = computed(() => !!route.meta?.layout)
</script>

<template>
  <router-view v-if="isBareLayout" />
  <AppShell v-else :crumb="page.crumb" :search-placeholder="page.search">
    <router-view />
  </AppShell>
  <NewBriefModal v-if="!isBareLayout" />
  <CreateWorkspaceDrawer v-if="!isBareLayout" />
  <ArtifactDrawer v-if="!isBareLayout" />
</template>
