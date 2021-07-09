<template>
  <form @submit="goToRoom">
    <input
      v-model="username"
      required
      type="text"
    >

    <button>
      Start
    </button>
  </form>
</template>

<script>
import { ref } from 'vue'
import { Room } from '@models/Room'

export default {
  name: 'Home',
  setup() {
    const username = ref('')

    const goToRoom = () => {
      const room = new Room()
      room.addUser(username.value)
    }

    return {
      username,
      goToRoom,
    }
  },
}
</script>
