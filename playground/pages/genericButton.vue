<template>
  <Clickable
    disabled
    @click="console.log('been clicked')"
  >
    <div class="test">
      hello
    </div>
  </Clickable>
</template>

<style lang="css" scoped>
.test:hover {
    background: red;
}
</style>
