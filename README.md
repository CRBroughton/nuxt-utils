# nuxt-utils

A collection of utility functions for Nuxt applications.

## Installation

```bash
npm install @crbroughton/nuxt-utils
```

## Utilities

### createStore

Creates a lightweight store using Vue's dependency injection system. Provides a simple way to share state across components without prop drilling.

```typescript
// Create a store
const [provideCounter, useCounter, createRawCounter] = createStore(
  'counter',
  () => {
    const count = ref(0)
    const increment = () => count.value++
    return { count, increment }
  }
)

// In a parent component
provideCounter()

// In a child component
const { count, increment } = useCounter()
```

### useManualParallelFetch & createUseParallelFetch

Utilities for making parallel API requests and combining results into a single response.

```typescript
// Option 1: Use with custom fetch functions
const { data } = useManualParallelFetch(
  'dashboard-data',
  {
    user: () => $fetch('/api/user'),
    posts: () => $fetch('/api/posts')
  }
)

// Option 2: Create a configured hook with URL strings
const useParallelFetch = createUseParallelFetch($fetch)

const { data } = useParallelFetch(
  'dashboard-data',
  {
    user: '/api/user',
    posts: '/api/posts'
  }
)
```

MIT License