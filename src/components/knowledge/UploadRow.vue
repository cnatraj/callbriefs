<script setup>
import { ref } from 'vue'
import { IconArrowUpRight, IconPlus } from '@/components/icons'

const fileInput = ref(null)
const dropOver = ref(false)

const onDragEnter = (e) => {
  e.preventDefault()
  dropOver.value = true
}
const onDragLeave = () => (dropOver.value = false)
const onDrop = (e) => {
  e.preventDefault()
  dropOver.value = false
}
const openPicker = () => fileInput.value?.click()
</script>

<template>
  <div class="grid gap-[14px]" style="grid-template-columns: 1.4fr 1fr">
    <!-- Dropzone -->
    <div
      class="flex items-center gap-4 p-5 rounded-[12px] bg-surface cursor-pointer transition-[background,border-color] duration-150"
      :style="
        dropOver
          ? 'border: 1.5px dashed var(--accent-strong); background: color-mix(in oklch, var(--accent) 10%, var(--surface) 90%);'
          : 'border: 1.5px dashed var(--ink-200);'
      "
      @dragenter="onDragEnter"
      @dragover="onDragEnter"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @click="openPicker"
    >
      <div
        class="w-12 h-12 shrink-0 grid place-items-center rounded-[10px] border border-ink-150 bg-bg text-ink-700"
      >
        <IconArrowUpRight :size="20" />
      </div>
      <div class="min-w-0">
        <div class="text-[14.5px] font-semibold" style="letter-spacing: -0.01em">
          Drop files or paste a link
        </div>
        <div class="text-[12.5px] text-ink-500 mt-[3px]">
          PDF, DOCX, PPTX, XLSX, MP3/MP4, PNG · up to 500 MB each
        </div>
      </div>
      <button
        class="ml-auto flex items-center gap-[7px] px-[14px] py-[9px] rounded-[8px] bg-accent hover:bg-accent-strong text-accent-ink border border-accent-strong font-semibold text-[13px] cursor-pointer transition-colors"
      >
        <IconPlus :size="14" :sw="2.2" /> Upload
      </button>
      <input ref="fileInput" type="file" multiple class="hidden" />
    </div>

    <!-- Connected sources -->
    <div class="flex flex-col gap-[10px] p-4 rounded-[12px] border border-ink-150 bg-surface">
      <div class="flex justify-between text-[12px] font-medium text-ink-500">
        <span>Connected sources</span>
        <a class="text-ink-900 font-medium cursor-pointer">Manage →</a>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div
          class="flex items-center gap-2 px-[10px] py-[8px] rounded-[8px] border border-ink-150 bg-bg text-[12.5px] text-ink-700 cursor-pointer"
        >
          <span class="w-[14px] h-[14px] rounded-[3px] bg-ink-900 shrink-0" />
          Google Drive
          <span class="ml-auto w-[6px] h-[6px] rounded-full bg-ok" />
        </div>
        <div
          class="flex items-center gap-2 px-[10px] py-[8px] rounded-[8px] border border-ink-150 bg-bg text-[12.5px] text-ink-700 cursor-pointer"
        >
          <span class="w-[14px] h-[14px] rounded-[3px] bg-info shrink-0" />
          Notion
          <span class="ml-auto w-[6px] h-[6px] rounded-full bg-ok" />
        </div>
        <div
          class="flex items-center gap-2 px-[10px] py-[8px] rounded-[8px] border border-ink-150 bg-bg text-[12.5px] text-ink-700 cursor-pointer"
        >
          <span class="w-[14px] h-[14px] rounded-[3px] bg-ok shrink-0" />
          SharePoint
          <span class="ml-auto w-[6px] h-[6px] rounded-full bg-ink-200" />
        </div>
        <div
          class="flex items-center gap-2 px-[10px] py-[8px] rounded-[8px] border border-ink-150 bg-bg text-[12.5px] text-ink-700 cursor-pointer"
        >
          <span class="w-[14px] h-[14px] rounded-[3px] bg-danger shrink-0" />
          Dropbox
          <span class="ml-auto w-[6px] h-[6px] rounded-full bg-ink-200" />
        </div>
      </div>
    </div>
  </div>
</template>
