<script setup lang="ts">
import { provideCountStore } from '~/store'

const { count, incrementCount } = provideCountStore()
</script>

<template>
  <div>
    {{ count }}
    <button @click="incrementCount">
      Increment
    </button>
    <ChildCountTest />
  </div>
</template>
