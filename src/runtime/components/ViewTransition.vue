<template>
  <slot />
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

const isSupported = ref(false)

onMounted(() => {
  isSupported.value = typeof document.startViewTransition === 'function'
})

function startTransition(callback: () => void) {
  if (!isSupported.value) {
    callback()
    return
  }

  document.startViewTransition(() => {
    callback()
    return nextTick()
  })
}

function navigate(to: string) {
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
