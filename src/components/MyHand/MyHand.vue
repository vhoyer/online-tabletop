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

    const html = (...args) => args.join('');

    return {
      hand,
      cardType: {
        template: html`
          <div style="font-size:2rem; font-weight:bold; position: absolute; inset: 8px; text-align: left;">{default}</div>
          <div style="font-size:2rem; font-weight:bold; position: absolute; inset: 8px; text-align: left; transform: rotate(180deg)">{default}</div>

          <div style="font-size:8rem; font-weight:bold">{default}</div>
        `,
      },
      cardDataList: [
        { default: `1` },
        { default: `2` },
        { default: `3` },
        { default: `4` },
        { default: `5` },
        { default: `6` },
        { default: `7` },
        { default: `8` },
        { default: `9` },
        { default: `10` },
      ],
    };
  },
};
</script>

<style lang="scss">
.my-hand {
  z-index: 0;
  display: flex;
  justify-content: flex-start;
  padding-left: var(--space-m);
  padding-right: var(--space-m);
  padding-bottom: var(--space-m);
  gap: var(--space-xl);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  transform: translateY(75%);
  overflow-x: scroll;
  transition-timing-function: ease-out;
  transition-property: transform, gap;
  transition-duration: .2s;
}

.my-hand--open {
  gap: var(--space-m);
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
