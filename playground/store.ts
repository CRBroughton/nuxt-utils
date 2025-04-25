export const [provideCountStore, useCountStore, rawCounterStore] = createStore('demo-store', () => {
  const count = ref(0)
  const incrementCount = () => count.value++

  return {
    count,
    incrementCount,
  }
})
