<script setup lang="ts">
function doAThing() {
  console.log('did the thing')
}
</script>

<template>
  <Clickable @click="doAThing">
    <div>
      I do a thing
    </div>
  </Clickable>
</template>

<style scoped>
.clickable {
    width: 30px;
    height: 30px;
    background: red;
}
</style>
