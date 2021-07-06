<template>
  <div
    v-if="hand.isOpen"
    class="my-hand__backdrop"
    @click="hand.isOpen = false"
  />
  <div
    class="my-hand"
    :class="{
      'my-hand--open': hand.isOpen,
    }"
    tabindex="0"
    @click="hand.isOpen = true"
  >
    <Card
      v-for="data in cardDataList"
      :key="JSON.stringify(data)"
      :type="cardType"
      :data="data"
      class="my-hand__item"
    />
  </div>
</template>

<script>
import Card from '@components/Card';
import { reactive } from 'vue';

export default {
  name: 'MyHand',
  components: {
    Card,
  },
  setup() {
    const hand = reactive({ isOpen: false });

    return {
      hand,
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

<style lang="scss">
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
  overflow-x: scroll;
  transition-timing-function: ease-out;
  transition-property: transform;
  transition-duration: .2s;
}

.my-hand--open {
  transform: translateY(0%);
  justify-content: flex-start;

  & > .my-hand__item.my-hand__item {
    margin-left: 0;
  }
}

.my-hand__item {
  flex-shrink: 0;
  transition-timing-function: ease-out;
  transition-property: margin;
  transition-duration: .2s;

  &:not(:first-child) {
    margin-left: calc(-1 * var(--card-width));
  }
}

.my-hand__backdrop {
  position: fixed;
  inset: 0;
  background-color: var(--color-coal-500);
  opacity: var(--opacity-m);
}
</style>
