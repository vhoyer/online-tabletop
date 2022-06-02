<template>
</template>

<script setup>
import { inject, watch } from 'vue';
import * as PIXI from 'pixi.js'

const phi = 1.618033988749895;
const width = 250;
const height = width * phi;

const card = new PIXI.Graphics();
card.beginFill(0xffffff);
card.drawRoundedRect(0, 0, width, height);
card.endFill();

const tabletop = inject('tabletop');

let didAddChild = false;
watch(tabletop, (tabletop) => {
  if (tabletop === undefined) return;
  if (didAddChild) return;

  tabletop.addChild(card);
  didAddChild = true;
}, { immediate: true });
</script>
