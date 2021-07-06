import { defineConfig } from 'vite'
import { ViteAliases } from 'vite-aliases'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    ViteAliases(),
    vue(),
  ]
})
