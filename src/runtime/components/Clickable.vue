<script setup lang="ts">
const {
  disabled = false,
  type = 'button',
  ariaLabel,
} = defineProps<{
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
}>()

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    :type
    :disabled
    :aria-label
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
button {
  background: none;
  border: none;
  margin: 0;
  padding: 0;
  font: inherit;
  color: inherit;
  text-decoration: inherit;
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
}
</style>
