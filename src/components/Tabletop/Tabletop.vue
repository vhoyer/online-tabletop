<template>
  <canvas
    ref="canvas"
    class="tabletop"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide } from 'vue'
import { xyAdd, xyNeg } from '@utils/coordinates';
import * as PIXI from 'pixi.js'

const canvas = ref()
const app = ref()

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

  const world = new PIXI.Container();
  world.interactive = true;

  const setHitAreaToView = () => {
    world.hitArea = new PIXI.Rectangle(-world.x, -world.y, app.value.screen.width, app.value.screen.height);
  }
  setHitAreaToView();
  const moveStart = { x: 0 , y: 0 };
  world.on('pointerdown', (e) => {
    const screenPoint = xyAdd(xyNeg(world), e.data.global)

    Object.assign(moveStart, screenPoint);
  });
  world.on('pointermove', (e) => {
    if (e.data.buttons <= 0) return;

    const screenPoint = xyAdd(xyNeg(world), e.data.global)

    const moveNow = screenPoint;
    const moveDiff = xyAdd(xyNeg(moveStart), moveNow)

    Object.assign(world, xyAdd(world, moveDiff))
  });
  world.on('pointerup', setHitAreaToView);

  const grid = [ new PIXI.Graphics(), new PIXI.Graphics(), new PIXI.Graphics(), new PIXI.Graphics() ];

  const gridSize = 100;
  const gridOffset = gridSize / 2;
  const xEnd = (Math.ceil((app.value.screen.width  - gridOffset) / gridSize) + 1) * gridSize;
  const yEnd = (Math.ceil((app.value.screen.height - gridOffset) / gridSize) + 1) * gridSize;
  // grid.forEach(g => g.x = -1 * gridOffset);
  // grid.forEach(g => g.y = -1 * gridOffset);;

  // reposition
  grid.forEach((g, index) => g.x = (xEnd * (index % 2)));
  grid.forEach((g, index) => g.y = (yEnd * Math.floor(index / 2)));;

  grid.forEach(g => g.lineStyle({
    width: 1,
    color: COLOR_DARK_OLIVE_GREEN,
    alpha: 0.4,
  }));
  for (const x in Array.from({ length: Math.ceil(xEnd / gridSize) })) {
    grid.forEach(g => g.moveTo(gridSize * (Number(x) + 1) - gridOffset, 0));
    grid.forEach(g => g.lineTo(gridSize * (Number(x) + 1) - gridOffset, yEnd));
  }
  for (const y in Array.from({ length: Math.ceil(yEnd / gridSize) })) {
    grid.forEach(g => g.moveTo(0,    gridSize * (Number(y) + 1) - gridOffset));
    grid.forEach(g => g.lineTo(xEnd, gridSize * (Number(y) + 1) - gridOffset));
  }

  grid.forEach(g => world.addChild(g));

  app.value.stage.addChild(world);
})
onUnmounted(() => {
  app.value.destroy(false, {
    children: true,
    texture: true,
    baseTexture: true,
  })
})

provide('tabletop', app)
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
