<template>
  <section>
    <h2>game info</h2>

    <input
      type="file"
      accept="application/json"
      @change="onGameChange"
    >

    <div>
      Selected game: {{ room.game?.name ?? 'None' }}
    </div>

    <fieldset v-if="Boolean(room.game?.config)">
      <template
        v-for="(options, name) in room.game.config"
        :key="name"
      >
        <label :for="name">{{ name }}</label>
        <br>
        <textarea
          :id="name"
          v-model="options.editableValue"
          cols="100"
          rows="10"
        />
      </template>
    </fieldset>

    <router-link
      v-if="Boolean(room.game)"
      :to="{ name: 'table', params: $route.params }"
    >
      Play {{ room.game.name }}
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
        props.room.gameSet(null);
        console.error('[APP] No file selected', files, event);
        return;
      }

      const reader = new FileReader();

      reader.onload = ({ target: { result: fileContent } }) => {
        try {
          const gameRaw = JSON.parse(fileContent);
          console.info('[APP] file read, add game to room', gameRaw);

          props.room.gameSet(gameRaw);
        } catch (error) {
          console.error('[APP] error parsing game file:', error);
        }
      };

      console.info('[APP] begin reading files[0]', reader);
      reader.readAsText(files[0]);
    };

    return {
      onGameChange,
    };
  },
};
</script>
