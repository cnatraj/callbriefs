<script setup>
defineProps({
  modelValue: { type: String, default: "" },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: "" },
  autocomplete: { type: String, default: "off" },
});
defineEmits(["update:modelValue"]);
</script>

<template>
  <div
    class="flex items-center gap-2 h-[46px] px-[14px] rounded-[10px] border border-ink-200 bg-surface focus-within:border-ink-900 transition-colors"
  >
    <slot name="prefix" />
    <input
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :value="modelValue"
      class="flex-1 min-w-0 bg-transparent outline-none text-ink-900 placeholder:text-ink-400"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <slot name="suffix" />
  </div>
</template>
