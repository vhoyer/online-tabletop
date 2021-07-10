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
import { useRouter } from 'vue-router'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()

    const username = ref('')

    const goToRoom = async () => {
      const room = new Room()
      room.addUser(username.value)

      const { key } = await roomCreate(room)

      router.push({
        name: 'room',
        params: { key },
      })
    }

    return {
      username,
      goToRoom,
    }
  },
}
</script>
