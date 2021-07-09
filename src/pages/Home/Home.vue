<template>
  <form @submit.prevent="goToRoom">
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
import { roomCreate } from '@services/rooms'

export default {
  name: 'Home',
  setup() {
    const username = ref('')

    const goToRoom = async () => {
      const room = new Room()
      room.addUser(username.value)

      console.log(await roomCreate(room))
    }

    return {
      username,
      goToRoom,
    }
  },
}
</script>
