<script setup>
import { computed } from 'vue'
import { MICROSITE } from '@/data/microsite'
import { IconCalendar, IconArrowRight } from '@/components/icons'

const props = defineProps({
  briefOwner: { type: Object, default: null },
  // 'fixed' pins to viewport (prospect page).
  // 'sticky' sticks to bottom of the nearest scroll container (preview drawer).
  mode: { type: String, default: 'fixed' },
})

const ownerName = computed(
  () => props.briefOwner?.name ?? MICROSITE.rep.name,
)
</script>

<template>
  <div
    class="z-10 flex items-center gap-2 p-[9px] border border-ink-150 rounded-[14px]"
    :class="
      mode === 'sticky'
        ? 'sticky bottom-4 self-center'
        : 'fixed bottom-4 left-1/2 -translate-x-1/2'
    "
    style="
      width: calc(100% - 32px);
      max-width: 420px;
      background: color-mix(in oklch, var(--surface) 88%, transparent 12%);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      box-shadow:
        0 16px 40px -16px rgba(20, 20, 20, 0.25),
        0 2px 6px rgba(20, 20, 20, 0.04);
    "
  >
    <div class="px-[10px] py-[4px] shrink-0 min-w-0">
      <div
        class="text-[11px] text-ink-500 leading-[1.2]"
        style="white-space: nowrap"
      >
        with {{ ownerName }}
      </div>
      <div
        class="text-[13px] font-medium text-ink-900 leading-[1.25] mt-[2px]"
        style="white-space: nowrap"
      >
        {{ MICROSITE.rep.timeSlot }}
      </div>
    </div>

    <button
      class="ml-auto inline-flex items-center gap-[6px] px-4 py-[11px] rounded-[10px] bg-accent hover:bg-accent-strong text-accent-ink border border-accent-strong font-semibold cursor-pointer shadow-cta-inset text-[13.5px] transition-colors"
      style="white-space: nowrap; letter-spacing: -0.005em"
    >
      <IconCalendar :size="15" :sw="1.8" />
      Book a call
      <IconArrowRight :size="15" :sw="2" />
    </button>
  </div>
</template>
