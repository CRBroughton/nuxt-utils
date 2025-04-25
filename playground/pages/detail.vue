<template>
  <div class="page">
    <h1>Home Page</h1>
    {{

viewTransition?.isSupported

    }}
    <ViewTransition
      ref="viewTransition"
      to="homepage"
    >
      <Card
        class="card"
        style="view-transition-name: shared-box"
      />
    </ViewTransition>
    <button @click="viewTransition?.navigate">
      Go to Homepage Page
    </button>
  </div>
</template>

<script setup lang="ts">
const viewTransition = useTemplateRef('viewTransition')
</script>

<style scoped>
.card {
  position: absolute;
  top: 0;
  left: 0;
}

.page {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.shared-element {
  background-color: #3498db;
  color: white;
  padding: 2rem;
  border-radius: 18px;
  font-size: 1.5rem;
  text-align: center;
  width: 300px;
}

button {
  padding: 0.75rem 1.5rem;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background-color: #27ae60;
}
</style>
