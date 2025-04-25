<script setup lang="ts">
import { useCountStore } from '~/store'

const { count, incrementCount } = useCountStore()
</script>

<template>
  <div>
    {{ count }}
    <button @click="incrementCount">
      Increment
    </button>
  </div>
</template>
