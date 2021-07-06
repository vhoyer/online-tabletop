<template>
  <MyHand />
</template>

<script>
import MyHand from '@components/MyHand'

export default {
  components: {
    MyHand,
  }
}
</script>

<style>
:root {
  --space-m: 16px;

  --border-m: 1px solid darkgray;

  --border-radius-m: 10px;

  --card-border-radius: var(--border-radius-m);
  --card-border: var(--border-m);
  --card-width: 250px;
  --card-height: calc(var(--card-width) * 1.4);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
}
</style>
