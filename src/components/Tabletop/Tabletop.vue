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
  xyCenter, xyAdd, xyNeg, xySame, xySet, xyTimes, xyDivide, xyMin, xyMax,
  whtoxy, xytowh, xyIncrement, xyCentroid, xyDistanceSquared, xyApply,
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
      lastEvent: e,
      downAt: xyAdd(xyNeg(world), e.data.global),
      isDragging: true,
      isPinching: false,
    };

    const isDraggingList = Object.values(pointerList).map(i => i.isDragging);
    const countTrue = isDraggingList.reduce((count, bool) => count + Number(bool), 0);
    if (countTrue === 2) {
      // if more than one try dragging, no one is dragging
      Object.assign(pointerList, mapValues(pointerList,
        v => Object.assign(v, {
          isDragging: false,
          isPinching: true,
          pair: Object.values(pointerList).filter(p => p !== v)[0],
        }),
      ));
    }
  }));
  world.addEventListener('pointermove', onlySelf((e) => {
    pointerList[e.data.pointerId] = {
      ...pointerList[e.data.pointerId],
      lastEvent: e,
      moveAt: xyAdd(xyNeg(world), e.data.global),
    };

    const {
      isDragging,
      isPinching,
    } = pointerList[e.data.pointerId];

    if (isDragging) {
      const { downAt, moveAt } = pointerList[e.data.pointerId];
      const moveDiff = xyAdd(xyNeg(downAt), moveAt);
      xyIncrement(world, moveDiff);
      return;
    }

    if (isPinching) {
      const {
        downAt: d1, moveAt: m1,
        pair: { downAt: d2, moveAt: m2 },
      } = pointerList[e.data.pointerId];

      if (!m2) return;

      const originalMidpoint = xyCentroid(d1, d2);
      const currentMidpoint = xyCentroid(m1, m2);
      const moveDiff = xyAdd(xyNeg(originalMidpoint), currentMidpoint);
      xyIncrement(world, moveDiff);
      world.updateTransform();

      const distanceStart = xyDistanceSquared(d1, d2);
      const distanceNow = xyDistanceSquared(m1, m2);
      const direction = distanceNow > distanceStart ? 1 : -1;

      onZoomRequest(direction);

      return;
    }
  }));
  world.addEventListener('pointerup', onlySelf((e) => {
    const { isPinching } = pointerList[e.data.pointerId];
    if (isPinching) {
      // if one stops pinching, no one is pinching
      Object.assign(pointerList, mapValues(pointerList,
        v => Object.assign(v, {
          isPinching: false,
        }),
      ));
    }

    pointerList[e.data.pointerId] = {
      lastEvent: e,
      isDragging: false,
      isPinching: false,
    };
    setHitAreaToView();
  }));

  const onZoomRequest = window.onZoomRequest = (direction, { x, y } = xyCenter(app.value.screen)) => {
    const maxZoom = xySame(3);
    const minZoom = xySame(0.15);
    const newScale = xyTimes(world.scale, xySame(1 + direction * 0.1));
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
    xyIncrement(world, xyTimes(xyAdd(after, xyNeg(before)), world.scale));
    world.updateTransform(); // this avoid bug when multiple calls are made sequentially

    setHitAreaToView();
  };

  world.interactiveMousewheel = true;
  world.addEventListener('mousewheel', onZoomRequest);

  const gridRowSize = 2;
  const grid = Array.from({ length: gridRowSize ** 2 }).fill().map(() => new PIXI.Graphics());

  const gridSize = 100;
  const gridSizeXY = xySame(gridSize);
  const gridOffset = gridSize / 2;
  const gridOffsetXY = xySame(gridOffset);
  const gridEnd = xyTimes(gridSizeXY, xyAdd(xySame(1), xyApply(Math.ceil, xyDivide(xyAdd(xyNeg(gridOffsetXY), whtoxy(app.value.screen)), gridSizeXY))));

  const panelLineCount = xyApply(Math.ceil, xyDivide(gridEnd, gridSizeXY));

  grid.forEach((panel, index) => {
    const positionIndexOffset = {
      x: index % gridRowSize,
      y: Math.floor(index / gridRowSize),
    };

    xySet(panel.position, xyTimes(gridEnd, positionIndexOffset));
    panel.lineStyle({
      width: 1,
      color: COLOR_DARK_OLIVE_GREEN,
      alpha: 0.4,
      native: true,
    });

    for (const x in Array.from({ length: panelLineCount.x })) {
      const xPos = gridSize * (Number(x) + 1) - gridOffset;
      panel.moveTo(xPos, 0);
      panel.lineTo(xPos, gridEnd.y);
    }
    for (const y in Array.from({ length: panelLineCount.y })) {
      const yPos = gridSize * (Number(y) + 1) - gridOffset;
      panel.moveTo(0, yPos);
      panel.lineTo(gridEnd.y, yPos);
    }

    app.value.ticker.add(() => {
      xySet(panel.position,
        xyTimes(gridEnd, xyAdd(xyApply(Math.floor, xyDivide(xyNeg(world.position), gridEnd)), positionIndexOffset)));
    });

    world.addChild(panel);
  });

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
