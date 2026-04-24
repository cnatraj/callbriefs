<script setup>
import { ref } from "vue";
import TextField from "@/components/auth/TextField.vue";
import { IconBuilding, IconLink, IconArrowRight } from "@/components/icons";

defineEmits(["next"]);

const company = ref("");
const website = ref("");
</script>

<template>
  <div>
    <h1
      class="text-[28px] font-semibold text-ink-900 leading-[1.1]"
      style="letter-spacing: -0.03em"
    >
      Welcome to CallBriefs.
    </h1>
    <p class="text-ink-500 mt-3">
      Let's get your workspace set up. This takes about 30 seconds.
    </p>

    <form
      class="flex flex-col gap-5 mt-8"
      @submit.prevent="$emit('next', { company, website })"
    >
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-[13px] font-medium text-ink-900">
            Company name
          </label>
          <span class="text-[13px] text-ink-500">
            You can change this later
          </span>
        </div>
        <TextField
          v-model="company"
          placeholder="Acme Inc."
          autocomplete="organization"
        >
          <template #prefix>
            <IconBuilding :size="16" class="text-ink-500" />
          </template>
        </TextField>
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-[13px] font-medium text-ink-900">
            Company website
          </label>
          <span class="text-[13px] text-ink-500">Optional</span>
        </div>
        <TextField
          v-model="website"
          type="url"
          placeholder="acme.com"
          autocomplete="url"
        >
          <template #prefix>
            <IconLink :size="16" class="text-ink-500" />
          </template>
        </TextField>
      </div>

      <button
        type="submit"
        class="inline-flex items-center justify-center gap-[10px] py-3 rounded-[12px] bg-accent hover:bg-accent-strong text-accent-ink border border-accent-strong font-semibold cursor-pointer shadow-cta transition-colors"
      >
        Get started
        <IconArrowRight :size="16" :sw="2" />
      </button>
    </form>
  </div>
</template>
