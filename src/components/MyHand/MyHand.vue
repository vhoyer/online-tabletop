<template>
  <div
    class="my-hand"
    tabindex="0"
  >
    <Card
      class="my-hand__item"
      tabindex="0"
      v-for="data in cardDataList"
      :type="cardType"
      :data="data"
    />
  </div>
</template>

<script>
import Card from '@components/Card';

export default {
  name: 'MyHand',
  components: {
    Card,
  },
  setup() {
    return {
      cardType: {
        template: `
          <div style="">{default}</div>
        `,
      },
      cardDataList: [
        { default: `1` },
        { default: `2` },
        { default: `3` },
        { default: `4` },
      ],
    };
  },
};
</script>

<style>
.my-hand {
  z-index: 0;
  display: flex;
  justify-content: center;
  padding-left: var(--space-m);
  padding-right: var(--space-m);
  padding-bottom: var(--space-m);
  gap: var(--space-m);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  transform: translateY(75%);
  transition: transform .3s ease-in;
}

.my-hand:focus,
.my-hand:focus-within {
  transform: translateY(0%);
}

.my-hand__item {
  flex-shrink: 0;
  transition-duration: .2s;
  transition-timing-function: ease-in;
  transition-property: transform, box-shadow;
}

.my-hand__item:not(:first-child) {
  margin-left: calc(-1 * var(--card-width));
}

.my-hand__item:hover {
  z-index: 1;
  transform: translateY(-10%);
  box-shadow: 0 0 0 5px black;
}
</style>
