<template>
  <UserSetup @submit="goToRoom" />
</template>

<script>
import { Room } from '@models/Room';
import { roomCreate } from '@services/rooms';
import { useRouter } from 'vue-router';
import UserSetup from '@components/UserSetup';

export default {
  name: 'Home',
  components: {
    UserSetup,
  },
  setup() {
    const router = useRouter();

    const goToRoom = async (user) => {
      const room = new Room();
      room.userAdd(user.name);

      const { key } = await roomCreate(room);

      router.push({
        name: 'room',
        params: { key },
      });
    };

    return {
      goToRoom,
    };
  },
};
</script>
