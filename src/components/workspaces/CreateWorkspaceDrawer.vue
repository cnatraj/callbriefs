<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import AppDrawer from '@/components/AppDrawer.vue'
import { useCreateWorkspaceDrawer } from '@/composables/useCreateWorkspaceDrawer'
import { useOrgStore } from '@/stores/org'

const { isOpen, close } = useCreateWorkspaceDrawer()
const org = useOrgStore()

const name = ref('')
const inputRef = ref(null)
const submitting = ref(false)
const submitError = ref(null)

const trimmed = computed(() => name.value.trim())
const canSubmit = computed(() => trimmed.value.length > 0 && !submitting.value)

const PALETTE = [
  'oklch(62% 0.16 240)',
  'oklch(62% 0.18 25)',
  'oklch(60% 0.15 150)',
  'oklch(60% 0.20 310)',
  'oklch(60% 0.18 55)',
]

const colorForKey = (key) => {
  if (!key) return PALETTE[0]
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

const initials = computed(() => {
  const n = trimmed.value
  if (!n) return '?'
  const parts = n.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
})

const previewColor = computed(() =>
  colorForKey(trimmed.value.toLowerCase() || 'default'),
)

// Reset form when drawer closes; focus input when it opens
watch(isOpen, (open) => {
  if (open) {
    submitError.value = null
    nextTick(() => inputRef.value?.focus())
  } else {
    name.value = ''
    submitError.value = null
    submitting.value = false
  }
})

const handleSubmit = async () => {
  if (!canSubmit.value) return
  submitting.value = true
  submitError.value = null
  const { error: err } = await org.createWorkspace({ name: trimmed.value })
  submitting.value = false
  if (err) {
    submitError.value = err.message
    return
  }
  close()
}
</script>

<template>
  <AppDrawer :open="isOpen" width="480px" @close="close">
    <template #header>
      <div>
        <div
          class="text-[22px] font-semibold text-ink-900"
          style="letter-spacing: -0.02em"
        >
          Create workspace
        </div>
        <div class="text-ink-500 mt-1">
          in {{ org.currentOrg?.name ?? 'your organization' }}
        </div>
      </div>
    </template>

    <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-2">
        <label class="eyebrow" for="workspace-name-input">
          Workspace name
        </label>
        <input
          id="workspace-name-input"
          ref="inputRef"
          v-model="name"
          type="text"
          placeholder="Northeast Enterprise"
          autocomplete="off"
          class="h-[46px] px-[14px] rounded-[10px] border border-ink-200 bg-surface outline-none text-ink-900 placeholder:text-ink-400 focus:border-ink-900 transition-colors"
        />
        <div class="text-[12.5px] text-ink-500">
          You can change this later in workspace settings.
        </div>
      </div>

      <!-- Preview -->
      <div
        class="flex items-center gap-3 px-[14px] py-[12px] rounded-[10px] bg-nav-bg border border-ink-100"
      >
        <div
          class="w-[34px] h-[34px] rounded-[8px] text-bg grid place-items-center font-semibold text-[13px] shrink-0"
          :style="{ background: previewColor }"
        >
          {{ initials }}
        </div>
        <div class="min-w-0 flex-1">
          <div class="eyebrow">Preview</div>
          <div class="font-medium text-ink-900 truncate mt-[1px]">
            {{ trimmed || 'Workspace name' }}
          </div>
        </div>
      </div>

      <!-- Error -->
      <div
        v-if="submitError"
        class="text-[13px] text-danger rounded-[8px] px-3 py-[10px]"
        style="
          background: color-mix(in oklch, var(--danger) 10%, white 90%);
          border: 1px solid
            color-mix(in oklch, var(--danger) 30%, var(--ink-150) 70%);
        "
      >
        {{ submitError }}
      </div>
    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <button
          type="button"
          class="inline-flex items-center justify-center px-4 h-[40px] rounded-[10px] bg-surface text-ink-900 border border-ink-200 font-medium cursor-pointer hover:bg-ink-100 transition-colors"
          @click="close"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="!canSubmit"
          class="inline-flex items-center justify-center px-4 h-[40px] rounded-[10px] font-semibold transition-colors"
          :class="
            canSubmit
              ? 'bg-accent hover:bg-accent-strong text-accent-ink border border-accent-strong shadow-cta cursor-pointer'
              : 'bg-ink-100 text-ink-500 border border-ink-150 cursor-not-allowed'
          "
          @click="handleSubmit"
        >
          {{ submitting ? 'Creating…' : 'Create workspace' }}
        </button>
      </div>
    </template>
  </AppDrawer>
</template>
