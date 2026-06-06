
<template>
  <PetHeader />
  <RouterView />
  <PetFooter />
</template>

  <script setup>
    import { RouterLink,RouterView } from 'vue-router';
    import PetHeader from './component/PetHeader.vue';
    import PetFooter from './component/PetFooter.vue';
  </script>

<style scoped></style>
