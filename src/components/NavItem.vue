<script setup>
import { useRoute, useRouter } from "vue-router";

const props = defineProps({
  to: { type: String, default: null },
  label: { type: String, required: true },
  count: { type: [String, Number], default: null },
  active: { type: Boolean, default: false },
});

const route = useRoute();
const router = useRouter();

const isActive = () =>
  props.active || (props.to && route.name === props.to.replace("/", ""));

const go = () => {
  if (props.to) router.push(props.to);
};
</script>

<template>
  <div
    class="flex items-center gap-[10px] px-[10px] py-[7px] rounded-sm cursor-pointer leading-tight transition-colors"
    :class="
      isActive()
        ? 'bg-nav-active text-ink-900 font-medium'
        : 'text-ink-700 hover:bg-nav-hover'
    "
    @click="go"
  >
    <span class="flex" :class="isActive() ? 'text-ink-900' : 'text-ink-500'">
      <slot name="icon" />
    </span>
    <span>{{ label }}</span>
    <span v-if="count != null" class="ml-auto mono text-[11px] text-ink-500">{{
      count
    }}</span>
  </div>
</template>
