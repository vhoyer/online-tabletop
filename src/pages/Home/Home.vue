<template>
  <form @submit.prevent="goToRoom">
    <input
      v-model="user.name"
      required
      type="text"
    >

    <button>
      Start
    </button>
  </form>
</template>

<script>
import { Room } from '@models/Room'
import { roomCreate } from '@services/rooms'
import { useRouter } from 'vue-router'
import { user } from '@store/user'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()

    const goToRoom = async () => {
      const room = new Room()
      room.addUser(user.name)

      const { key } = await roomCreate(room)

      router.push({
        name: 'room',
        params: { key },
      })
    }

    return {
      user,
      goToRoom,
    }
  },
}
</script>
