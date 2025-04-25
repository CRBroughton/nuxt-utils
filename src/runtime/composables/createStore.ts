import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'

/**
 * Creates a set of functions to provide, consume, and test a store using Vue's dependency injection.
 * Useful if you need state that is shared across multiple components without prop drilling.
 *
 * Also exposes the raw store creator for unit testing or non-component usage.
 *
 * @param id - A unique identifier for the store (used internally to create a Symbol)
 * @param init - A setup function that initialises and returns the store object.
 * When using init mode, both generic types must be supplied.
 * @returns A tuple containing [provideStore, useStore, createRawStore] functions
 *
 * @example
 * // Create the store functions in a TypeScript file
 * const [provideCounter, useCounter, createRawCounter] = createStore(
 *   'counter',
 *   (initialState = { value: 0 }) => {
 *     const count = ref(initialState.value)
 *
 *     function increment() {
 *       count.value++
 *     }
 *
 *     return { count, increment }
 *   }
 * )
 *
 * // In a parent component
 * // Initialise and provide the store to all child components
 * provideCounter({ value: 10 })
 *
 * // Or deconstruct the store if you require the values or functions in the parent
 * const { count, increment } = provideCounter({ value: 10 })
 *
 * // In any child component
 * // Access the store
 * const store = useCounter()
 *
 * // Or deconstruct the store if you require the values or functions in the child
 * const { count, increment } = useCounter()
 *
 * // Use the store values and methods
 * console.log(store.count.value) // 10
 * store.increment()
 * console.log(store.count.value) // 11
 *
 * // In your tests:
 * // Create a raw store with just the state and functions (no Vue injection)
 * const testStore = createRawCounter({ value: 5 })
 * expect(testStore.count.value).toBe(5)
 * testStore.increment()
 * expect(testStore.count.value).toBe(6)
 *
 * // Can also be used outside of components where Vue injection isn't available
 * const utilityStore = createRawCounter({ value: 0 })
 * utilityStore.increment()
 *
 * // Usage with explicit types
 * interface CounterState { value: number }
 *
 * interface CounterStore {
 *  count: Ref<number>
 *  increment: () => void
 * }
 *
 * const [provideCounter, useCounter, createRawCounter] = createStore<CounterState, CounterStore>(
 *   'counter-store',
 *   (initialState = { value: 0 }) => {
 *     const count = ref(initialState.value)
 *     const increment = () => { count.value++ }
 *     return { count, increment }
 *   }
 * )
 */
export const createStore = <
  State = Record<string, unknown>,
  Store = ReturnType<(initialState?: State) => unknown>,
>(
  id: string,
  init: (initialState?: State) => Store,
) => {
  const key: InjectionKey<Store> = Symbol(id)

  /**
   * Creates a raw store instance without any Vue dependency injection.
   * Contains only the state and functions - useful for testing or non-component usage
   *
   * @param initialState - Object containing the initial state values
   * @returns The initialised store state and functions
   */
  const createRawStore = (initialState?: State): Store => {
    return init(initialState)
  }

  /**
   * Initialises the store, makes it available to child components via Vue's inject/provide,
   * and returns the store instance
   *
   * @param initialState - Object containing the initial state values
   * @returns The initialised store instance
   */
  const provideStore = (initialState?: State): Store => {
    const service = createRawStore(initialState)
    provide(key, service)
    return service
  }

  /**
   * Retrieves the store instance. useStore can only retrieve the store if it has
   * been provided in the current component tree (e.g. in a parent component)
   *
   * @returns The store instance
   * @throws Will throw an error if called before the store has been provided
   * or outside of the store's provided scope
   */
  const useStore = (): Store => {
    const store = inject(key)
    if (store === undefined) {
      throw new Error(`Store with id "${id}" was not provided`)
    }
    return store
  }

  return [provideStore, useStore, createRawStore] as const
}
