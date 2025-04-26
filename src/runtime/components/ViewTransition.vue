<template>
  <slot />
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

const emit = defineEmits<{
  'transition-start': []
  'transition-end': []
  'navigation-start': [to: string]
}>()

const isSupported = ref(false)
onMounted(() => {
  isSupported.value = typeof document.startViewTransition === 'function'
})

/**
 * Starts a view transition if supported by the browser
 *
 * @param callback - The function to execute during the transition
 * @returns Promise if transitions are supported, void otherwise
 */
function startTransition(callback: () => void) {
  if (!isSupported.value) {
    callback()
    return
  }

  emit('transition-start')

  const transition = document.startViewTransition(() => {
    callback()
    return nextTick()
  })

  transition.finished.then(() => {
    emit('transition-end')
  })

  return transition
}

/**
 * Navigate to a different route with view transitions if supported
 *
 * @param to - The destination route
 */
function navigate(to: string) {
  emit('navigation-start', to)

  if (isSupported.value === true) {
    startTransition(() => {
      navigateTo(to)
    })
  }
  else {
    navigateTo(to)
  }
}

defineExpose({ startTransition, navigate, isSupported })
</script>
