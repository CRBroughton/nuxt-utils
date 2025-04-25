<script setup lang="ts">
const test = createUseParallelFetch($fetch, {
  baseURL: 'https://dummyjson.com',
  onRequest({ options }) {
    console.log('onRequest', options)
  },
  onResponse({ response }) {
    console.log('onResponse', response)
  },
  onResponseError({ error }) {
    console.log('onResponseError', error)
  },
})

type FirstTen = {
  products: {
    id: number
  }[]
}
type SecondTen = {
  products: {
    id: number
  }[]
}
const { data, status } = await test<{
  firstTen: FirstTen
  secondTen: SecondTen
}>('blah', {
  firstTen: `/products?limit=10&skip=${0 * 10}`,
  secondTen: `/products?limit=10&skip=${1 * 10}`,
}, {
  server: false,
})
</script>

<template>
  <div v-if="status !== 'success'">
    loading...
  </div>
  <div v-else>
    <div
      v-for="product in data?.firstTen.products"
      :key="product.id"
    >
      {{ product.id }}
    </div>
    <div
      v-for="product in data?.secondTen.products"
      :key="product.id"
    >
      {{ product.id }}
    </div>
  </div>
</template>
