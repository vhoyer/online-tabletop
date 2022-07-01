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
  xyInvert,
} from '@utils/coordinates';
import { isSelf } from '@utils/event';
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

  const setHitAreaToView = window.setHitAreaToView = () => {
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

  // courtesy from https://github.com/anvaka/ngraph/blob/master/examples/pixi.js/03%20-%20Zoom%20And%20Pan/globalInput.js
  const getVirtualPositionFromScreenPosition = ({ x, y }, { relativeTo = world } = {}) => {
    // https://github.com/pixijs/pixijs/blob/dev/packages/math/src/Matrix.ts
    return relativeTo.worldTransform.applyInverse({ x, y });
  };

  const setZoomScaleCenteredAt = window.setZoomScaleCenteredAt = (newScaleRaw, zoomCenter = xyCenter(app.value.screen)) => {
    const newScale = typeof newScaleRaw === 'number' ? xySame(newScaleRaw) : newScaleRaw;
    const maxZoom = xySame(3);
    const minZoom = xySame(0.15);
    const newScaleBottomAndTopCapped = xyMin(maxZoom, xyMax(minZoom, newScale));

    const keepCenterWhileScaleChange = (displayObject) => {
      const before = getVirtualPositionFromScreenPosition(zoomCenter, { relativeTo: displayObject });
      displayObject.updateTransform();
      const after = getVirtualPositionFromScreenPosition(zoomCenter, { relativeTo: displayObject });

      xyIncrement(displayObject.position, xyTimes(xyAdd(after, xyNeg(before)), displayObject.scale));
      displayObject.updateTransform(); // this avoid bug when multiple calls are made sequentially
    };

    xySet(world.scale, newScaleBottomAndTopCapped);
    keepCenterWhileScaleChange(world);

    // invert grid scale to keep it the same visual size while changing scale
    xySet(grid.scale, xyInvert(world.scale));
    keepCenterWhileScaleChange(grid);
  };

  const pointerList = {};
  world.addEventListener('pointerdown', (e) => {
    pointerList[e.data.pointerId] = {
      id: e.data.pointerId,
      downAt: e.data.global.clone(),
      isDragging: isSelf(e), // only drag if is a self event
      isPinching: false,
    };

    const activePointerList = Object.values(pointerList).filter(p => Boolean(p.downAt));
    if (activePointerList.length === 2) {
      // if more than one is active, it's not a drag, it's a pinch
      const [{ id: idMain }, { id: idPair }] = activePointerList;

      Object.assign(pointerList[idMain], {
        isDragging: false,
        isPinching: true,
        startScale: world.scale.x,
        pair: pointerList[idPair],
      });
      Object.assign(pointerList[idPair], {
        isDragging: false,
        isPinching: true,
        main: pointerList[idMain],
      });
    }
  });
  world.addEventListener('pointermove', (e) => {
    const pointer = pointerList[e.data.pointerId];
    if (!pointer) return; // if no pointer exists, it's just hovering

    Object.assign(pointer, {
      lastAt: pointer.moveAt ?? pointer.downAt,
      moveAt: e.data.global.clone(),
    });

    const {
      isDragging,
      isPinching, pair,
    } = pointer;

    if (isDragging) {
      if (!isSelf(e)) return;

      const { lastAt, moveAt } = pointer;
      const moveDiff = xyAdd(xyNeg(lastAt), moveAt);
      xyIncrement(world, moveDiff);
    }

    if (isPinching && Boolean(pair)) {
      const { downAt: d1, lastAt: l1, moveAt: m1, startScale } = pointer;
      const { downAt: d2, lastAt: l2, moveAt: m2 } = pair;

      if (!m2) return;

      // zoom
      const distanceStart = Math.sqrt(xyDistanceSquared(d1, d2));
      const distanceNow = Math.sqrt(xyDistanceSquared(m1, m2));
      const newScale = (startScale * distanceNow) / distanceStart;
      setZoomScaleCenteredAt(xySame(newScale));

      // pan
      const midpointLast = xyCentroid(l1, l2);
      const midpointNow = xyCentroid(m1, m2);
      const moveDiff = xyAdd(xyNeg(midpointLast), midpointNow);
      xyIncrement(world, moveDiff);
      world.updateTransform();
    }

    setHitAreaToView();
  });
  world.addEventListener('pointerup', (e) => {
    const { isPinching, main } = pointerList[e.data.pointerId];
    if (isPinching && Boolean(main)) {
      // if one stops pinching, no one is pinching
      Object.assign(main, {
        isPinching: false,
      });
    }

    pointerList[e.data.pointerId] = {
      isDragging: false,
      isPinching: false,
    };
  });

  world.interactiveMousewheel = true;
  world.addEventListener('mousewheel', (direction, { x, y }) => {
    const newScale = xyTimes(world.scale, xySame(1 + direction * 0.1));
    setZoomScaleCenteredAt(newScale, { x, y });

    setHitAreaToView();
  });

  const gridRowSize = 2;
  const grid = window.grid = Array.from({ length: gridRowSize ** 2 }).fill().map(() => new PIXI.Graphics()).reduce((c, p) => (c.addChild(p), c), new PIXI.Container());

  const gridSize = 100;
  const gridSizeXY = xySame(gridSize);
  const gridOffset = gridSize / 2;
  const gridOffsetXY = xySame(gridOffset);
  const gridEnd = xyTimes(gridSizeXY, xyAdd(xySame(1), xyApply(Math.ceil, xyDivide(xyAdd(xyNeg(gridOffsetXY), whtoxy(app.value.screen)), gridSizeXY))));

  const panelLineCount = xyApply(Math.ceil, xyDivide(gridEnd, gridSizeXY));

  grid.children.forEach((panel, index) => {
    const positionIndexOffset = {
      x: index % gridRowSize,
      y: Math.floor(index / gridRowSize),
    };

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
      panel.lineTo(gridEnd.x, yPos);
    }

    app.value.ticker.add(() => {
      xySet(panel.position,
        xyTimes(gridEnd, xyAdd(xyApply(Math.floor, xyDivide(xyNeg(world.position), gridEnd)), positionIndexOffset)));
    });
  });

  world.addChild(grid);
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
