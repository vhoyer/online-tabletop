<template>
  <form @submit.prevent="onSubmit">
    <input
      v-model="user.name"
      required
      type="text"
    >

    <button>Start</button>
  </form>
</template>

<script setup>
import { user } from '@store/user';

const emit = defineEmits([
  'submit',
]);

const onSubmit = () => {
  user.hasLoggedIn = true;
  emit('submit', user);
};
</script>
