<template>
  <div>
    <ViewTransition ref="transition">
      <div class="transition-container">
        <div
          v-if="show"
          class="my-box left-box"
        >
          🟦 Blue Box
        </div>
        <div
          v-else
          class="my-box right-box"
        >
          🟥 Red Box
        </div>
      </div>
    </ViewTransition>
    <button @click="toggle">
      Toggle Box
    </button>
  </div>
</template>

<script setup lang="ts">
const show = ref(true)
const transition = useTemplateRef('transition')

function toggle() {
  if (transition.value) {
    transition.value.startTransition(() => {
      show.value = !show.value
    })
  }
}
</script>

<style>
.transition-container {
position: relative;
min-height: 80px;
width: 100%;
overflow: hidden;
}

.my-box {
view-transition-name: my-box;
padding: 20px;
margin: 20px;
display: inline-block;
position: absolute;
}

.left-box {
left: 0;
}

.right-box {
right: 0;
}

::view-transition-old(my-box) {
animation: warpOut 0.3s cubic-bezier(0.2, 0, 0.1, 1) forwards;
}

::view-transition-new(my-box) {
animation: warpIn 0.3s cubic-bezier(0.9, 0, 0.8, 1) forwards;
}

@keyframes warpOut {
0% {
    opacity: 1;
    transform: scale(1);
}
50% {
    opacity: 0.8;
    transform: scale(0.2);
}
100% {
    opacity: 0;
    transform: scale(0);
}
}

@keyframes warpIn {
0% {
    opacity: 0;
    transform: scale(0);
}
50% {
    opacity: 0.8;
    transform: scale(0.2);
}
100% {
    opacity: 1;
    transform: scale(1);
}
}
</style>
