<template>
  <input
    v-model="username"
    type="text"
  >

  <button @click="goToRoom">
    Start
  </button>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Home',
  setup() {
    const username = ref('')

    const goToRoom = () => {
    }

    return {
      username,
      goToRoom,
    }
  },
};
</script>
