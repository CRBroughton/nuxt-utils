<script setup lang="ts">
const {
  disabled = false,
  ariaLabel,
} = defineProps<{
  disabled?: boolean
  ariaLabel?: string
}>()

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  if (disabled) return
  emit('click', event)
}
</script>

<template>
  <div
    :disabled
    :aria-label
    :style="{ cursor: disabled ? 'not-allowed' : 'pointer' }"
    @click="handleClick"
  >
    <slot />
  </div>
</template>

<style scoped>
div {
  background: none;
  border: none;
  margin: 0;
  padding: 0;
  font: inherit;
  color: inherit;
  text-decoration: inherit;
}
</style>
