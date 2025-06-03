<!-- components/Glare.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useTilt } from '../composables/useTilt'

interface Props {
  effect?: string
  opacity?: number
}

const props = withDefaults(defineProps<Props>(), {
  opacity: 0.3,
})

const tiltStore = useTilt()

const glareStyle = computed(() => {
  // Calculate mouse position as percentage
  let x = 50
  let y = 50

  if (tiltStore.elementWidth.value > 0 && !tiltStore.isOutside.value) {
    x = (tiltStore.elementX.value / tiltStore.elementWidth.value) * 100
    y = (tiltStore.elementY.value / tiltStore.elementHeight.value) * 100
  }

  // Default subtle effect
  const defaultEffect = `radial-gradient(ellipse 70% 50% at ${x}% ${y}%, rgba(255,255,255,${props.opacity}) 0%, rgba(255,255,255,0) 60%)`

  // Use custom effect if provided, replacing placeholders
  const background = props.effect
    ? props.effect
        .replace(/\{x\}/g, x.toString())
        .replace(/\{y\}/g, y.toString())
        .replace(/\{opacity\}/g, props.opacity.toString())
        .replace(/\{angle\}/g, Math.atan2(y - 50, x - 50).toString())
    : defaultEffect

  return {
    opacity: 1,
    background,
  }
})
</script>

<template>
  <div class="glare-wrapper">
    <slot />
    <div
      class="glare-overlay"
      :style="glareStyle"
    />
  </div>
</template>

<style scoped>
.glare-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.glare-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}
</style>
