import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Real build stamp, shown in the status bar.
const BUILD_ID = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')

export default defineConfig({
  plugins: [vue()],
  // /work/x -> work/x/index.html, so any static host serves clean URLs.
  ssgOptions: { dirStyle: 'nested' },
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
})
