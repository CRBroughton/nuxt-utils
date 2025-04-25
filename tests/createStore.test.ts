import { describe, it, expect } from 'vitest'
import { ref, defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { createStore } from '../src/runtime/composables/createStore'

describe('createStore', () => {
  // Define types for our test store
  interface CounterState {
    value: number
  }

  interface CounterStore {
    count: ReturnType<typeof ref<number>>
    increment: () => void
    reset: (value?: number) => void
  }

  // Create test store functions
  const [provideCounter, useCounter, createRawCounter] = createStore<CounterState, CounterStore>(
    'counter',
    (initialState = { value: 0 }) => {
      const count = ref(initialState.value)

      function increment() {
        count.value++
      }

      function reset(value = 0) {
        count.value = value
      }

      return { count, increment, reset }
    },
  )

  describe('createRawStore', () => {
    it('should create a store with default initial state', () => {
      const store = createRawCounter()
      expect(store.count.value).toBe(0)
    })

    it('should create a store with provided initial state', () => {
      const store = createRawCounter({ value: 10 })
      expect(store.count.value).toBe(10)
    })

    it('should be usable outside of Vue components', () => {
      const store = createRawCounter({ value: 5 })
      store.increment()
      expect(store.count.value).toBe(6)

      store.reset(20)
      expect(store.count.value).toBe(20)
    })
  })

  describe('provideStore and useStore', () => {
    // Create test components
    const ParentComponent = defineComponent({
      props: {
        initialValue: {
          type: Number,
          default: 0,
        },
      },
      setup(props) {
        const store = provideCounter({ value: props.initialValue })
        return { store }
      },
      render() {
        return h('div', { id: 'parent' }, [
          h('span', `Count: ${this.store.count.value}`),
          h('button', {
            id: 'increment',
            onClick: this.store.increment,
          }, 'Increment'),
          h('div', { id: 'child-container' }, [
            h(ChildComponent),
          ]),
        ])
      },
    })

    const ChildComponent = defineComponent({
      setup() {
        const store = useCounter()
        return { store }
      },
      render() {
        return h('div', { id: 'child' }, [
          h('span', `Child count: ${this.store.count.value}`),
          h('button', {
            id: 'child-increment',
            onClick: this.store.increment,
          }, 'Child increment'),
          h('button', {
            id: 'child-reset',
            onClick: () => this.store.reset(100),
          }, 'Reset to 100'),
        ])
      },
    })

    it('should provide and use the store across components', async () => {
      const wrapper = mount(ParentComponent, {
        props: {
          initialValue: 5,
        },
      })

      // Initial state is correct in parent
      expect(wrapper.find('#parent span').text()).toBe('Count: 5')
      // Initial state is correct in child
      expect(wrapper.find('#child span').text()).toBe('Child count: 5')

      // Increment from parent affects both components
      await wrapper.find('#increment').trigger('click')
      expect(wrapper.find('#parent span').text()).toBe('Count: 6')
      expect(wrapper.find('#child span').text()).toBe('Child count: 6')

      // Increment from child affects both components
      await wrapper.find('#child-increment').trigger('click')
      expect(wrapper.find('#parent span').text()).toBe('Count: 7')
      expect(wrapper.find('#child span').text()).toBe('Child count: 7')

      // Reset from child affects both components
      await wrapper.find('#child-reset').trigger('click')
      expect(wrapper.find('#parent span').text()).toBe('Count: 100')
      expect(wrapper.find('#child span').text()).toBe('Child count: 100')
    })

    it('should throw an error when useStore is called without a provider', () => {
      const OrphanComponent = defineComponent({
        setup() {
          const getStore = () => useCounter()
          return { getStore }
        },
        render() {
          return h('div')
        },
      })

      const wrapper = mount(OrphanComponent)
      expect(() => wrapper.vm.getStore()).toThrow('Store with id "counter" was not provided')
    })
  })

  describe('multiple stores', () => {
    interface UserState {
      name: string
      age: number
    }
    interface UserStore {
      name: Ref<string>
      age: Ref<number>
      updateName: (newName: string) => void
      incrementAge: (number: string) => void
    }
    const [provideUser] = createStore<UserState, UserStore>(
      'user',
      (initialState = { name: '', age: 0 }) => {
        const name = ref(initialState.name)
        const age = ref(initialState.age)

        function updateName(newName: string) {
          name.value = newName
        }

        function incrementAge() {
          age.value++
        }

        return { name, age, updateName, incrementAge }
      },
    )

    const MultiStoreComponent = defineComponent({
      setup() {
        const counterStore = provideCounter({ value: 10 })
        const userStore = provideUser({ name: 'John', age: 30 })

        return { counterStore, userStore }
      },
      render() {
        return h('div', { id: 'multi-store' }, [
          h('div', { id: 'counter-value' }, `Counter: ${this.counterStore.count.value}`),
          h('div', { id: 'user-info' }, `User: ${this.userStore.name.value}, ${this.userStore.age.value}`),
          h('button', {
            id: 'counter-button',
            onClick: this.counterStore.increment,
          }, 'Increment Counter'),
          h('button', {
            id: 'age-button',
            onClick: this.userStore.incrementAge,
          }, 'Increment Age'),
          h('button', {
            id: 'name-button',
            onClick: () => this.userStore.updateName('Jane'),
          }, 'Change Name'),
        ])
      },
    })

    it('should handle multiple independent stores', async () => {
      const wrapper = mount(MultiStoreComponent)

      // Initial values are correct
      expect(wrapper.find('#counter-value').text()).toBe('Counter: 10')
      expect(wrapper.find('#user-info').text()).toBe('User: John, 30')

      // Update counter store
      await wrapper.find('#counter-button').trigger('click')
      expect(wrapper.find('#counter-value').text()).toBe('Counter: 11')
      expect(wrapper.find('#user-info').text()).toBe('User: John, 30')

      // Update user store - age
      await wrapper.find('#age-button').trigger('click')
      expect(wrapper.find('#counter-value').text()).toBe('Counter: 11')
      expect(wrapper.find('#user-info').text()).toBe('User: John, 31')

      // Update user store - name
      await wrapper.find('#name-button').trigger('click')
      expect(wrapper.find('#counter-value').text()).toBe('Counter: 11')
      expect(wrapper.find('#user-info').text()).toBe('User: Jane, 31')
    })
  })

  describe('typed store usage', () => {
    // Define a more complex store with typed parameters and return values
    interface TodoItem {
      id: number
      text: string
      completed: boolean
    }

    interface TodoState {
      items: TodoItem[]
    }

    interface TodoStore {
      todos: Ref<TodoItem[]>
      addTodo: (text: string) => TodoItem
      toggleTodo: (id: number) => void
      removeTodo: (id: number) => void
      incompleteTodos: () => TodoItem[]
    }

    const [_provide, _inject, createRawTodos] = createStore<TodoState, TodoStore>(
      'todos',
      (initialState = { items: [] }) => {
        const todos = ref<TodoItem[]>([...initialState.items])

        function addTodo(text: string): TodoItem {
          const newTodo: TodoItem = {
            id: Date.now(),
            text,
            completed: false,
          }
          todos.value.push(newTodo)
          return newTodo
        }

        function toggleTodo(id: number): void {
          const todo = todos.value.find(t => t.id === id)
          if (todo) {
            todo.completed = !todo.completed
          }
        }

        function removeTodo(id: number): void {
          todos.value = todos.value.filter(t => t.id !== id)
        }

        function incompleteTodos(): TodoItem[] {
          return todos.value.filter(t => !t.completed)
        }

        return { todos, addTodo, toggleTodo, removeTodo, incompleteTodos }
      },
    )

    it('should properly handle complex typed stores', () => {
      const initialTodos: TodoItem[] = [
        { id: 1, text: 'Learn Vue', completed: true },
        { id: 2, text: 'Learn Nuxt', completed: false },
      ]

      const store = createRawTodos({ items: initialTodos })

      // Check initial state
      expect(store.todos.value).toHaveLength(2)
      expect(store.todos.value[0].text).toBe('Learn Vue')

      // Add a todo
      const newTodo = store.addTodo('Learn TypeScript')
      expect(store.todos.value).toHaveLength(3)
      expect(newTodo.text).toBe('Learn TypeScript')
      expect(newTodo.completed).toBe(false)

      // Toggle a todo
      store.toggleTodo(2)
      expect(store.todos.value[1].completed).toBe(true)

      // Remove a todo
      store.removeTodo(1)
      expect(store.todos.value).toHaveLength(2)
      expect(store.todos.value[0].id).toBe(2)

      // Check computed values
      const incomplete = store.incompleteTodos()
      expect(incomplete).toHaveLength(1)
      expect(incomplete[0].id).toBe(newTodo.id)
    })
  })
})
