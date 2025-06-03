<script setup lang="ts">

</script>

<template>
  <div class="main-container">
    <TiltEffect>
      <ShineEffect>
        <img
          width="400"
          class="card"
          src="https://images.pokemontcg.io/swsh12pt5/160_hires.png"
        >
      </ShineEffect>
    </TiltEffect>
  </div>
</template>

<style lang="css">
body {
  padding: 0;
  margin: 0;
}
.main-container {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

img {
  height: fit-content;
}
</style>
