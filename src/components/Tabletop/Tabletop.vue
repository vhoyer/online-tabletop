<template>
  <canvas
    ref="canvas"
    class="tabletop"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const canvas = ref()
const ctx = computed(() => canvas.value.getContext('2d'))

const updateCanvasSize = () => {
  const { width, height } = canvas.value.getBoundingClientRect()

  canvas.value.width = width
  canvas.value.height = height
}
onMounted(() => {
  updateCanvasSize()
  window.addEventListener('resize', updateCanvasSize, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('resize', updateCanvasSize)
})

onMounted(() => {
  const width = canvas.value.width
  const height = canvas.value.height

  console.log({
    canvas,
    width,
    height,
    ctx,
  })

  ctx.value.fillStyle = 'green'
  ctx.value.fillRect(0, 0, width, height);
})
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
