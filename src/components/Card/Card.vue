<template>
  <div class="card">
    <div v-html="html" />
  </div>
</template>

<script>
import { Card } from '@models/entities'

export default {
  name: 'Card',
  props: {
    card: {
      type: Card,
      required: true,
    },
  },
  setup(props) {
    return {
      html: props.card.rendered,
    }
  },
}
</script>

<style>
.card {
  position: relative;
  border-radius: var(--card-border-radius);
  border: var(--card-border);
  width: var(--card-width);
  height: var(--card-height);
  contain: strict;
  text-align: center;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
