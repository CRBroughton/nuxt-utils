<script setup lang="ts">
import { useTemplateRef, computed } from 'vue'
import { provideTilt, type TiltOptions } from '../composables/useTilt'

interface Props extends TiltOptions {
  radius?: number
  boxShadow?: string
}

const props = withDefaults(defineProps<Props>(), {
  maxTilt: 15,
  perspective: 1000,
  scale: 1.05,
  radius: 12,
  boxShadow: '0.4px 0.5px 0.7px hsl(252deg 3% 27% / 0.36), 1.4px 1.7px 2.5px -0.8px hsl(252deg 3% 27% / 0.36), 3.4px 4.2px 6.1px -1.7px hsl(252deg 3% 27% / 0.36), 8.3px 10.2px 14.8px -2.5px hsl(252deg 3% 27% / 0.36)',
})

const target = useTemplateRef<HTMLElement>('target')

const tiltStore = provideTilt({
  target,
  options: {
    maxTilt: props.maxTilt,
    perspective: props.perspective,
    scale: props.scale,
  },
})

const borderRadius = computed(() => `${props.radius}px`)
const transform = computed(() => tiltStore.transform.value)
</script>

<template>
  <div
    ref="target"
    class="tilt-container"
    :style="{
      transform,
      borderRadius,
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
.tilt-container {
  position: relative;
  transform-style: preserve-3d;
  transform-origin: center;
  will-change: transform;
  overflow: hidden;
  max-width: 100%;
  width: fit-content;
  box-shadow: v-bind(boxShadow);
}

.tilt-container :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: inherit;
}

.tilt-container :deep(*) {
  border-radius: inherit;
}
</style>
