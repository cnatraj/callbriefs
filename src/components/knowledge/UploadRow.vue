<script setup>
import { ref, computed } from 'vue'
import { IconArrowUpRight, IconPlus, IconX } from '@/components/icons'
import { useDocumentsStore } from '@/stores/documents'
import { ALLOWED_MIMES, MAX_BYTES } from '@/services/documents'

const documents = useDocumentsStore()

const fileInput = ref(null)
const dropOver = ref(false)
const uploadingName = ref(null)
const errors = ref([])

const isUploading = computed(() => !!uploadingName.value)

const validate = (file) => {
  if (!ALLOWED_MIMES.includes(file.type)) return 'Unsupported file type'
  if (file.size > MAX_BYTES) return 'File exceeds 50 MB'
  return null
}

const handleFiles = async (files) => {
  for (const file of files) {
    const invalid = validate(file)
    if (invalid) {
      errors.value.push({ name: file.name, message: invalid })
      continue
    }
    uploadingName.value = file.name
    const { error: err } = await documents.uploadDocument({ file })
    if (err) errors.value.push({ name: file.name, message: err.message })
    uploadingName.value = null
  }
}

const onDragEnter = (e) => {
  e.preventDefault()
  dropOver.value = true
}
const onDragLeave = () => (dropOver.value = false)
const onDrop = (e) => {
  e.preventDefault()
  dropOver.value = false
  const files = Array.from(e.dataTransfer?.files ?? [])
  if (files.length) handleFiles(files)
}

const openPicker = () => {
  if (isUploading.value) return
  fileInput.value?.click()
}

const onFileInputChange = (e) => {
  const files = Array.from(e.target.files ?? [])
  if (files.length) handleFiles(files)
  e.target.value = ''
}

const dismissError = (i) => errors.value.splice(i, 1)
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="grid gap-[14px]" style="grid-template-columns: 1.4fr 1fr">
      <!-- Dropzone -->
      <div
        class="flex items-center gap-4 p-5 rounded-[12px] bg-surface transition-[background,border-color] duration-150"
        :class="isUploading ? 'cursor-wait' : 'cursor-pointer'"
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
          <div
            class="text-[14.5px] font-semibold"
            style="letter-spacing: -0.01em"
          >
            <template v-if="isUploading">
              Uploading {{ uploadingName }}…
            </template>
            <template v-else>Drop files or paste a link</template>
          </div>
          <div class="text-[12.5px] text-ink-500 mt-[3px]">
            PDF or images · up to 50 MB each
          </div>
        </div>
        <button
          type="button"
          :disabled="isUploading"
          class="ml-auto flex items-center gap-[7px] px-[14px] py-[9px] rounded-[8px] bg-accent hover:bg-accent-strong text-accent-ink border border-accent-strong font-semibold text-[13px] cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          @click.stop="openPicker"
        >
          <IconPlus :size="14" :sw="2.2" /> Upload
        </button>
        <input
          ref="fileInput"
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp,.gif"
          class="hidden"
          @change="onFileInputChange"
        />
      </div>

      <!-- Connected sources (decorative for now) -->
      <div
        class="flex flex-col gap-[10px] p-4 rounded-[12px] border border-ink-150 bg-surface"
      >
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

    <!-- Errors -->
    <div v-if="errors.length" class="flex flex-col gap-1">
      <div
        v-for="(err, i) in errors"
        :key="i"
        class="flex items-center gap-2 text-[13px] text-danger rounded-[8px] px-3 py-[8px]"
        style="
          background: color-mix(in oklch, var(--danger) 10%, white 90%);
          border: 1px solid
            color-mix(in oklch, var(--danger) 30%, var(--ink-150) 70%);
        "
      >
        <span class="font-medium truncate flex-1">
          {{ err.name }} — {{ err.message }}
        </span>
        <button
          class="bg-transparent border-0 cursor-pointer text-danger opacity-70 hover:opacity-100"
          @click="dismissError(i)"
        >
          <IconX :size="12" />
        </button>
      </div>
    </div>
  </div>
</template>
