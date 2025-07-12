<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const {
  to,
  href,
  target = '_self',
  rel,
  external = false,
  replace = false,
  exactActiveClass,
  activeClass,
  ariaLabel,
} = defineProps<{
  to?: RouteLocationRaw
  href?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  rel?: string
  external?: boolean
  replace?: boolean
  exactActiveClass?: string
  activeClass?: string
  ariaLabel?: string
}>()

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <NuxtLink
    :to
    :href
    :target
    :rel
    :external
    :replace
    :exact-active-class
    :active-class
    :aria-label
    @click="emit('click', $event)"
  >
    <slot />
  </NuxtLink>
</template>

<style scoped>
a {
  color: inherit;
  text-decoration: inherit;
  font: inherit;
}
</style>
