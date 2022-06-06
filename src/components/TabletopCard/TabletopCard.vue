<!-- eslint-disable-next-line vue/valid-template-root -->
<template />

<script setup>
import { inject, watch, onUnmounted } from 'vue';
import { xySame, xySet, xyCenter } from '@utils/coordinates';
import * as PIXI from 'pixi.js';

const props = defineProps({
  color: {
    type: String,
    default: 'black',
  },
  main: {
    type: String,
    required: true,
  },
  corner: {
    type: String,
    default: '',
  },
});

const phi = 1.618033988749895;
const width = 250;
const height = width * phi;
const center = xyCenter({ width, height });
const padding = 16;
const wordWrapWidth = width - (2 * padding);

const textStyle = {
  fill: props.color,
  fontSize: 32,
  fontWeight: 'bold',
};

const textStyleMain = {
  ...textStyle,
  fontSize: (3 * textStyle.fontSize),
  wordWrap: true,
  wordWrapWidth,
  align: 'center',
};

const card = new PIXI.Graphics();
xySet(card.pivot, center);
card.beginFill(0xffffff);
card.drawRoundedRect(0, 0, width, height);
card.endFill();
card.interactiveChildren = false;
card.interactive = true;

const mainText = new PIXI.Text(props.main, textStyleMain);
xySet(mainText.pivot, xyCenter(mainText));
xySet(mainText, center);

card.addChild(mainText);

if (props.corner) {
  const cornerTextBuild = () => {
    const frame = new PIXI.Container();
    xySet(frame.pivot, center);
    xySet(frame, center);
    frame.width = width;
    frame.height = height;
    const text = new PIXI.Text(props.corner, textStyle);
    xySet(text, xySame(padding));
    frame.addChild(text);
    return frame;
  };

  const cornerText1 = cornerTextBuild();
  const cornerText2 = cornerTextBuild();
  cornerText2.rotation = Math.PI;

  card.addChild(cornerText1, cornerText2);
}

const tabletop = inject('tabletop');
const app = inject('tabletopApplication');

let didAddChild = false;
watch(tabletop, (tabletop) => {
  if (tabletop === undefined) return;
  if (didAddChild) return;

  tabletop.addChild(card);
  xySet(card, xyCenter(app.value.screen));
  didAddChild = true;
}, { immediate: true });

onUnmounted(() => {
  if (tabletop === undefined) return;
  tabletop.value.removeChild(card);
  card.destroy();
});
</script>
