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

      <div>
        Selected game: {{ room.game?.name ?? 'None' }}
      </div>

      <fieldset v-if="Boolean(room.game)">
        <template :key="name" v-for="(options, name) in room.game.config">
          <label :for="name">{{ name }}</label>
          <br>
          <textarea :id="name" cols="30" rows="10" v-model="options.editableValue" />
        </template>
      </fieldset>

      <input type="file" @change="onGameChange" accept="application/json">
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
import { onUnmounted, ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { roomSubscribe } from '@services/rooms'
import { Game } from '@models/Game'
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

    const onGameChange = (event) => {
      const { target: { files } } = event;

      if (files.length === 0) {
        room.value.setGame(null)
        console.error('[APP] No file selected', files, event);
        return
      }

      const reader = new FileReader();

      reader.onload = ({ target: { result: fileContent } }) => {
        try {
          const gameRaw = JSON.parse(fileContent)
          console.info('[APP] file read, add game to room', gameRaw)

          room.value.setGame(new Game(gameRaw))
        } catch (error) {
          console.error('[APP] error parsing game file:', error)
        }
      }

      console.info('[APP] begin reading files[0]', reader)
      reader.readAsText(files[0])
    }

    return {
      isLoading,
      room,
      user,
      onUserCreate,
      onGameChange,
    }
  },
}
</script>
