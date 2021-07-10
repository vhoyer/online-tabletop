<template>
  <router-link :to="{ name: 'home' }">
    Home
  </router-link>

  <div v-if="isLoading">
    loading...
  </div>
  <template v-else>
    <section>
      <h1>game info</h1>

      <button>choose a game</button>
    </section>

    <section>
      <h1>players</h1>

      <ul>
        <li
          v-for="({ type }, username) in room.users"
          :key="username"
        >
          {{ username }} [{{ type }}]
        </li>
      </ul>
    </section>
  </template>
</template>

<script>
import { onUnmounted, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { roomSubscribe } from '@services/rooms'
import { user } from '@store/user'

export default {
  name: 'Room',
  setup() {
    const router = useRouter()
    const { key } = useRoute().params

    const room = reactive({})
    const isLoading = ref(true)
    const unsubscribe = roomSubscribe(key, user.name, (data) => {
      Object.assign(room, data)

      isLoading.value = false
    }, () => {
      router.push({ name: 'home' })
    })
    onUnmounted(unsubscribe)

    return {
      isLoading,
      room,
    }
  },
}
</script>
