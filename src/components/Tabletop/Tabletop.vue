<template>
  <canvas
    ref="canvas"
    class="tabletop"
  />

  <slot />
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide } from 'vue';
import { xyAdd, xyNeg, xySame, xySet, xyMultiply, xyDivide, whtoxy, xytowh } from '@utils/coordinates';
import { onlySelf } from '@utils/event';
import '@_PIXI_plugins/mousewheel';
import '@pixi/events';
import * as PIXI from 'pixi.js';

window.PIXI = PIXI;

const canvas = ref()
const app = ref()
const worldRef = ref()

// const COLOR_FLAME = 0xE55934;
const COLOR_TIMBERWOLF = 0xD8DAD3;
// const COLOR_PUMPKIN = 0xFA7921;
const COLOR_DARK_OLIVE_GREEN = 0x657153;
// const COLOR_DARK_PURPLE = 0x3B1C32;

onMounted(() => {
  app.value = new PIXI.Application({
    view: canvas.value,
    resolution: window.devicePixelRatio ?? 1,
    resizeTo: window,
    backgroundColor: COLOR_TIMBERWOLF,
  })

  const world = new PIXI.Graphics();
  world.interactive = true;

  const setHitAreaToView = () => {
    const { x, y } = xyDivide(xyNeg(world), world.scale)
    const { width, height } = xytowh(xyDivide(whtoxy(app.value.screen), world.scale));

    const rect = [x, y, width, height];

    world.hitArea = new PIXI.Rectangle(...rect);
    if (world instanceof PIXI.Graphics) {
      world.clear();
      world.lineStyle({ color: 0xff0000, width: 5, alignment: 0 })
      world.drawRect(...rect);
    }
  }
  setHitAreaToView();
  let isDragging = false;
  const moveStart = { x: 0 , y: 0 };
  world.addEventListener('pointerdown', onlySelf((e) => {
    const screenPoint = xyAdd(xyNeg(world), e.data.global)

    Object.assign(moveStart, screenPoint);
    isDragging = true;
  }));
  world.addEventListener('pointermove', onlySelf((e) => {
    if (!isDragging) return;

    const screenPoint = xyAdd(xyNeg(world), e.data.global)

    const moveNow = screenPoint;
    const moveDiff = xyAdd(xyNeg(moveStart), moveNow)

    xySet(world, xyAdd(world, moveDiff))
  }));
  world.addEventListener('pointerup', onlySelf(setHitAreaToView));
  const draggingOff = onlySelf(() => { isDragging = false });
  world.addEventListener('pointerup', draggingOff);

  world.interactiveMousewheel = true;
  world.addEventListener('mousewheel', (direction, { x, y }) => {
    xySet(world.scale, xyMultiply(world.scale, xySame(1 + direction * 0.1)));
    xySet(world, xyAdd(world, (world, world.scale)));

    const screenPoint = { x, y };
    console.log(screenPoint)

    setHitAreaToView()
  });

  const gridRowSize = 2;
  const grid = Array.from({ length: gridRowSize ** 2 }).fill().map(() => new PIXI.Graphics());

  const gridSize = 100;
  const gridOffset = gridSize / 2;
  const xEnd = (Math.ceil((app.value.screen.width  - gridOffset) / gridSize) + 1) * gridSize;
  const yEnd = (Math.ceil((app.value.screen.height - gridOffset) / gridSize) + 1) * gridSize;

  // reposition
  grid.forEach((g, index) => g.x = (xEnd * (index % gridRowSize)));
  grid.forEach((g, index) => g.y = (yEnd * Math.floor(index / gridRowSize)));;

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
    grid.forEach(g => g.moveTo(0,    gridSize * (Number(y) + 1) - gridOffset));
    grid.forEach(g => g.lineTo(xEnd, gridSize * (Number(y) + 1) - gridOffset));
  }

  grid.forEach((g, index) => app.value.ticker.add(() => {
    g.x = xEnd * (Math.floor(-world.x / xEnd) + (index % gridRowSize))
    g.y = yEnd * (Math.floor(-world.y / yEnd) + Math.floor(index / gridRowSize))
  }))

  grid.forEach(g => world.addChild(g));
  worldRef.value = world;
  window.world = world;

  app.value.stage.addChild(world);
})
onUnmounted(() => {
  app.value.destroy(false, {
    children: true,
    texture: true,
    baseTexture: true,
  })
})

provide('tabletopApplication', app)
provide('tabletop', worldRef)
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
