<script setup lang="ts">
const { data, status } = await useParallelFetch('blah', {
  firstTen: `https://dummyjson.com/products?limit=10&skip=${0 * 10}`,
  secondTen: `https://dummyjson.com/products?limit=10&skip=${1 * 10}`,
}, {
  server: false,
})
</script>

<template>
  <div v-if="status !== 'success'">
    loading...
  </div>
  <div v-else>
    <div v-for="product in data?.firstTen.products">
      {{ product.id }}
    </div>
    <div v-for="product in data?.secondTen.products">
      {{ product.id }}
    </div>
  </div>
</template>
