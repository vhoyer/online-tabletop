<template>
  <router-link :to="{ name: 'home' }">
    Home
  </router-link>

  <div v-if="isLoading">
    loading...
  </div>
  <UserSetup
    v-else-if="!user.hasLoggedIn"
    @submit="onUserCreate"
  />
  <template v-else>
    <section>
      <h2>game info</h2>

      <button>choose a game</button>
    </section>

    <section>
      <h2>players</h2>

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
import { onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { roomSubscribe } from '@services/rooms'
import { user } from '@store/user'
import UserSetup from '@components/UserSetup'

export default {
  name: 'Room',
  components: {
    UserSetup,
  },
  setup() {
    const router = useRouter()
    const { key } = useRoute().params

    const room = ref(null)
    const isLoading = ref(true)
    const unsubscribe = ref(null)
    watch(() => user, (user) => {
      unsubscribe.value?.()

      unsubscribe.value = roomSubscribe(key, user.name, (data) => {
        room.value = data

        isLoading.value = false
      }, () => {
        router.push({ name: 'home' })
      })
    }, { deep: true, immediate: true })
    onUnmounted(() => unsubscribe.value?.())

    const onUserCreate = () => {
      room.value.userAdd(user.name)
    }

    return {
      isLoading,
      room,
      user,
      onUserCreate,
    }
  },
}
</script>
