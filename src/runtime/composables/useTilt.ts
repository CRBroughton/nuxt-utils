import { useMouseInElement } from '@vueuse/core'
import { computed, ref, onUnmounted, type Ref, watchEffect } from 'vue'
import { createStore } from '#imports'

export interface TiltOptions {
  maxTilt?: number
  perspective?: number
  scale?: number
}

export interface TiltState {
  target: Ref<HTMLElement | null>
  options: TiltOptions
}

export interface TiltStore {
  // Mouse tracking
  elementX: Ref<number>
  elementY: Ref<number>
  elementHeight: Ref<number>
  elementWidth: Ref<number>
  isOutside: Ref<boolean>

  // Animation state
  currentRotation: Readonly<Ref<{ x: number, y: number }>>
  currentScale: Readonly<Ref<number>>

  // Computed values
  transform: Ref<string>
}

export const [provideTilt, useTilt] = createStore<TiltState, TiltStore>(
  'tilt-store',
  (initialState) => {
    if (!initialState) {
      throw new Error('TiltStore requires initial state with target and options')
    }

    const { target, options } = initialState
    const {
      maxTilt = 15,
      perspective = 1000,
      scale = 1.05,
    } = options

    const {
      elementX,
      elementY,
      isOutside,
      elementHeight,
      elementWidth,
    } = useMouseInElement(target)

    // Helper functions
    const round = (value: number, precision = 3) => Number.parseFloat(value.toFixed(precision))
    const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max)
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor

    // Animation state
    const currentRotation = ref({ x: 0, y: 0 })
    const currentScale = ref(1)
    const targetRotation = ref({ x: 0, y: 0 })
    const targetScale = ref(1)

    // Animation loop
    let animationId: number | null = null

    const animate = () => {
      if (!import.meta.client) return

      const lerpFactor = 0.1

      currentRotation.value.x = lerp(currentRotation.value.x, targetRotation.value.x, lerpFactor)
      currentRotation.value.y = lerp(currentRotation.value.y, targetRotation.value.y, lerpFactor)
      currentScale.value = lerp(currentScale.value, targetScale.value, lerpFactor)

      const rotationDiff = Math.abs(currentRotation.value.x - targetRotation.value.x)
        + Math.abs(currentRotation.value.y - targetRotation.value.y)
      const scaleDiff = Math.abs(currentScale.value - targetScale.value)

      if (rotationDiff > 0.01 || scaleDiff > 0.001) {
        animationId = window.requestAnimationFrame(animate)
      }
      else {
        animationId = null
      }
    }

    const startAnimation = () => {
      if (!import.meta.client) return
      if (!animationId) {
        animationId = window.requestAnimationFrame(animate)
      }
    }
    // Watch mouse movement
    watchEffect(() => {
      if (isOutside.value) {
        targetRotation.value = { x: 0, y: 0 }
        targetScale.value = 1
        startAnimation()
        return
      }

      const rect = target.value?.getBoundingClientRect()
      if (!rect) return

      const percent = {
        x: clamp(round((100 / rect.width) * elementX.value)),
        y: clamp(round((100 / rect.height) * elementY.value)),
      }

      const center = {
        x: percent.x - 50,
        y: percent.y - 50,
      }

      const rotation = {
        x: round(-(center.y / 3.5)),
        y: round(center.x / 3.5),
      }

      targetRotation.value = rotation
      targetScale.value = scale

      startAnimation()
    })

    // Computed transform
    const transform = computed(() => {
      const rotateX = (currentRotation.value.x * maxTilt / 15).toFixed(2)
      const rotateY = (currentRotation.value.y * maxTilt / 15).toFixed(2)
      const scaleValue = currentScale.value

      return `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scaleValue}, ${scaleValue}, ${scaleValue})`
    })

    // Cleanup
    onUnmounted(() => {
      if (import.meta.client && animationId) {
        window.cancelAnimationFrame(animationId)
      }
    })

    return {
      // Mouse tracking (exposed as computed refs for reactivity)
      elementX,
      elementY,
      elementHeight,
      elementWidth,
      isOutside,

      // Animation state (readonly for external access)
      currentRotation,
      currentScale,

      // Computed values
      transform,
    }
  },
)
