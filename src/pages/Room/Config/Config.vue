<template>
  <section>
    <h2>game info</h2>

    <input type="file" @change="onGameChange" accept="application/json">

    <div>
      Selected game: {{ room.game?.name ?? 'None' }}
    </div>

    <fieldset v-if="Boolean(room.game?.config)">
      <template :key="name" v-for="(options, name) in room.game.config">
        <label :for="name">{{ name }}</label>
        <br>
        <textarea :id="name" cols="100" rows="10" v-model="options.editableValue" />
      </template>
    </fieldset>

    <router-link
      v-if="Boolean(room.game)"
      :to="{ name: 'table', params: $route.params }"
    >
      Play {{ room.game.name  }}
    </router-link>
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

<script>
export default {
  name: 'Config',
  props: {
    room: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const onGameChange = (event) => {
      const { target: { files } } = event;

      if (files.length === 0) {
        props.room.gameSet(null)
        console.error('[APP] No file selected', files, event);
        return
      }

      const reader = new FileReader();

      reader.onload = ({ target: { result: fileContent } }) => {
        try {
          const gameRaw = JSON.parse(fileContent)
          console.info('[APP] file read, add game to room', gameRaw)

          props.room.gameSet(gameRaw)
        } catch (error) {
          console.error('[APP] error parsing game file:', error)
        }
      }

      console.info('[APP] begin reading files[0]', reader)
      reader.readAsText(files[0])
    }

    return {
      room: props.room,
      onGameChange,
    }
  },
};
</script>
