<template>
  <canvas
    ref="canvas"
    class="tabletop"
  />

  <slot />
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide } from 'vue';
import {
  xyCenter, xyAdd, xyNeg, xySame, xySet, xyMultiply, xyDivide, xyMin, xyMax,
  whtoxy, xytowh,
} from '@utils/coordinates';
import { mapValues } from '@utils/object';
import { onlySelf } from '@utils/event';
import '@_PIXI_plugins/mousewheel';
import '@pixi/events';
import * as PIXI from 'pixi.js';

window.PIXI = PIXI;

const canvas = ref();
const app = ref();
const worldRef = ref();

// const COLOR_FLAME = 0xE55934;
const COLOR_TIMBERWOLF = 0xD8DAD3;
// const COLOR_PUMPKIN = 0xFA7921;
const COLOR_DARK_OLIVE_GREEN = 0x657153;
// const COLOR_DARK_PURPLE = 0x3B1C32;

onMounted(() => {
  window.app = app.value = new PIXI.Application({
    view: canvas.value,
    resolution: window.devicePixelRatio ?? 1,
    resizeTo: window,
    backgroundColor: COLOR_TIMBERWOLF,
  });

  const world = worldRef.value = window.world = new PIXI.Container();
  world.interactive = true;

  const setHitAreaToView = () => {
    const { x, y } = xyDivide(xyNeg(world), world.scale);
    const { width, height } = xytowh(xyDivide(whtoxy(app.value.screen), world.scale));

    const rect = [x, y, width, height];

    world.hitArea = new PIXI.Rectangle(...rect);
    if (world instanceof PIXI.Graphics) {
      world.clear();
      world.lineStyle({ color: 0xff0000, width: 5, alignment: 0 });
      world.drawRect(...rect);
      world.drawCircle(world.pivot.x, world.pivot.y, 15);
    }
  };
  setHitAreaToView();

  const pointerList = {};
  world.addEventListener('pointerdown', onlySelf((e) => {
    pointerList[e.data.pointerId] = {
      createdAt: performance.now(),
      lastEvent: e,
      downAt: xyAdd(xyNeg(world), e.data.global),
      isDragging: true,
    };

    const isDraggingList = Object.values(pointerList).map(i => i.isDragging);
    const countTrue = isDraggingList.reduce((count, bool) => count + Number(bool), 0);
    if (countTrue > 1) {
      // if more than one try dragging, no one is dragging
      Object.assign(pointerList, mapValues(
        pointerList,
        v => Object.assign(v, { isDragging: false }),
      ));
    }
  }));
  world.addEventListener('pointermove', onlySelf((e) => {
    Object.assign(pointerList[e.data.pointerId], {
      lastEvent: e,
      moveAt: xyAdd(xyNeg(world), e.data.global),
    });

    const {
      downAt,
      moveAt,
      isDragging,
    } = pointerList[e.data.pointerId];

    if (isDragging) {
      const moveDiff = xyAdd(xyNeg(downAt), moveAt);
      xySet(world, xyAdd(world, moveDiff));
      return;
    }
  }));
  world.addEventListener('pointerup', onlySelf((e) => {
    pointerList[e.data.pointerId] = {
      lastEvent: e,
      isDragging: false,
    };
    setHitAreaToView();
  }));

  const onZoomRequest = window.onZoomRequest = (direction, { x, y } = xyCenter(app.value.screen)) => {
    const maxZoom = xySame(3);
    const minZoom = xySame(0.15);
    const newScale = xyMultiply(world.scale, xySame(1 + direction * 0.1));
    const newScaleBottomAndTopCapped = xyMin(maxZoom, xyMax(minZoom, newScale));

    xySet(world.scale, newScaleBottomAndTopCapped);

    // center zoom on mouse position
    // courtesy from https://github.com/anvaka/ngraph/blob/master/examples/pixi.js/03%20-%20Zoom%20And%20Pan/globalInput.js
    const getWorldPositionRelativeToMouse = () => {
      const { getLocalPosition } = PIXI.InteractionData.prototype;
      const mouseClickAsObject = { global: { x, y } };
      return getLocalPosition.call(mouseClickAsObject, world);
    };
    const before = getWorldPositionRelativeToMouse();
    world.updateTransform();
    const after = getWorldPositionRelativeToMouse();
    xySet(world, xyAdd(world, xyMultiply(xyAdd(after, xyNeg(before)), world.scale)));
    world.updateTransform(); // this avoid bug when multiple calls are made sequentially

    setHitAreaToView();
  };

  world.interactiveMousewheel = true;
  world.addEventListener('mousewheel', onZoomRequest);

  const gridRowSize = 2;
  const grid = Array.from({ length: gridRowSize ** 2 }).fill().map(() => new PIXI.Graphics());

  const gridSize = 100;
  const gridOffset = gridSize / 2;
  const xEnd = (Math.ceil((app.value.screen.width - gridOffset) / gridSize) + 1) * gridSize;
  const yEnd = (Math.ceil((app.value.screen.height - gridOffset) / gridSize) + 1) * gridSize;

  // reposition
  grid.forEach((g, index) => g.x = (xEnd * (index % gridRowSize)));
  grid.forEach((g, index) => g.y = (yEnd * Math.floor(index / gridRowSize)));

  grid.forEach(g => g.lineStyle({
    width: 1,
    color: COLOR_DARK_OLIVE_GREEN,
    alpha: 0.4,
    native: true,
  }));
  for (const x in Array.from({ length: Math.ceil(xEnd / gridSize) })) {
    grid.forEach(g => g.moveTo(gridSize * (Number(x) + 1) - gridOffset, 0));
    grid.forEach(g => g.lineTo(gridSize * (Number(x) + 1) - gridOffset, yEnd));
  }
  for (const y in Array.from({ length: Math.ceil(yEnd / gridSize) })) {
    grid.forEach(g => g.moveTo(0, gridSize * (Number(y) + 1) - gridOffset));
    grid.forEach(g => g.lineTo(xEnd, gridSize * (Number(y) + 1) - gridOffset));
  }

  grid.forEach((g, index) => app.value.ticker.add(() => {
    g.x = xEnd * (Math.floor(-world.x / xEnd) + (index % gridRowSize));
    g.y = yEnd * (Math.floor(-world.y / yEnd) + Math.floor(index / gridRowSize));
  }));

  grid.forEach(g => world.addChild(g));

  app.value.stage.addChild(world);
});
onUnmounted(() => {
  app.value.destroy(false, {
    children: true,
    texture: true,
    baseTexture: true,
  });
});

provide('tabletopApplication', app);
provide('tabletop', worldRef);
</script>

<style>
.tabletop {
  position: fixed;
  inset: 0;
  height: 100%;
  width: 100%;
  z-index: -1;
}
</style>
