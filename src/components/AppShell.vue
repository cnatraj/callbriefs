<script setup>
import Sidebar from './Sidebar.vue'
import AppHeader from './AppHeader.vue'

defineProps({
  crumb: { type: String, default: 'Dashboard' },
  searchPlaceholder: { type: String, default: '' },
})
</script>

<template>
  <div class="grid h-screen min-h-screen bg-bg" style="grid-template-columns: 248px 1fr">
    <Sidebar />
    <div class="flex flex-col min-w-0">
      <AppHeader :crumb="crumb" :search-placeholder="searchPlaceholder" />
      <main class="flex-1 overflow-auto px-[28px] pt-[28px] pb-[60px]">
        <slot />
      </main>
    </div>
  </div>
</template>
