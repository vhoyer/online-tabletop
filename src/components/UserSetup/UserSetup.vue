<template>
  <form @submit.prevent="$emit('submit', user)">
    <input
      v-model="user.name"
      required
      type="text"
    >

    <button @click="user.hasLoggedIn = true">
      Start
    </button>
  </form>
</template>

<script>
import { user } from '@store/user'

export default {
  name: 'UserSetup',
  props: {
    onSubmit: {
      type: Function,
      default: () => {},
    },
  },
  emits: [
    'submit',
  ],
  setup() {
    return {
      user,
    }
  },
}
</script>
