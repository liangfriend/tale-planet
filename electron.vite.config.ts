import { resolve } from 'path'
import path from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

const engineSrc = path.resolve(__dirname, '../deciphony/packages/deciphony-engine/src')
const playerSrc = path.resolve(__dirname, '../deciphony/packages/deciphony-player/src')

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared'),
        'deciphony-engine': path.resolve(engineSrc, 'index.ts'),
        'deciphony-player': path.resolve(playerSrc, 'index.ts')
        // deciphony-engine 内部 deciphony-engine 与包入口必须指向同一份源码，避免被 Vite 当成两个模块实例
      }
    },
    plugins: [vue(), tailwindcss()]
  }
})
