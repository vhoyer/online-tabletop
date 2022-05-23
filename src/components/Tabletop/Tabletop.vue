<template>
  <canvas
    ref="canvas"
    class="tabletop"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref()

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

  const gl = canvas.value.getContext('webgl')

  console.log({
    canvas,
    width,
    height,
    gl,
  })

  gl.clearColor(0.95, 0.81, 0.75, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
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
