<template>
  <router-link :to="{ name: 'home' }">
    Home
  </router-link>

  <section>
    <h1>game info</h1>

    <dl>
      <dt>playing:</dt>
      <dd>
        notito
        <button>change game</button>
      </dd>

      <dt>config:</dt>
      <dd>
        <button>change config</button>
        <div>
          dummy config
        </div>
        <textarea disabled>Dolor sit sit molestiae sit cumque? Hic tempora vel nihil rerum quos Dolorem ducimus eveniet quibusdam at nesciunt, debitis Dolore ex eos voluptates beatae inventore incidunt dicta Dignissimos nesciunt enim</textarea>
      </dd>
    </dl>

    <button>play</button>
  </section>

  <section>
    <h1>players</h1>

    <ul>
      <li>dummy player</li>
    </ul>
  </section>

  <section>
    <h1>waiting/spectating</h1>

    <ul>
      <li>
        dummy not-player <button>promote to player</button>
      </li>
    </ul>
  </section>
</template>

<script>
export default {
  name: 'Room',
};
</script>
