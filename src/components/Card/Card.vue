<template>
  <div class="card">
    <div v-html="html" />
  </div>
</template>

<script>
import DOMPurify from 'dompurify'
import { cardType } from '@models/card.js';

export default {
  name: 'Card',
  props: {
    type: {
      type: Object,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const type = cardType(props.type)

    return {
      html: DOMPurify.sanitize(type.render(props.data)),
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
