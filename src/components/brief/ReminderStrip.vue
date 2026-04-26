<script setup>
import { IconBell } from "@/components/icons";

defineProps({
  prospectFirstName: { type: String, default: "Maya" },
});
</script>

<template>
  <div
    class="rounded-[12px] bg-ink-100 px-[20px] py-[16px] flex items-center gap-[16px]"
  >
    <div class="flex-1 min-w-0">
      <div class="text-ink-900 font-medium">
        Most prospects open within 4 hours.
      </div>
      <div class="text-ink-500 text-[13px] leading-[1.55] mt-[2px]">
        If {{ prospectFirstName }} hasn't viewed it by tomorrow, we'll nudge
        you with a pre-drafted reminder — or you can
        <a class="underline cursor-pointer text-ink-700">schedule one now</a>.
      </div>
    </div>

    <button
      type="button"
      class="inline-flex items-center gap-[6px] px-[14px] py-[8px] rounded-[8px] border border-ink-150 bg-surface text-ink-900 text-[12.5px] font-medium cursor-pointer hover:bg-surface transition-colors shrink-0"
    >
      <IconBell :size="13" />
      Set a reminder
    </button>
  </div>
</template>
