import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/scan': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/otp': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/verification': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      }
    }
  }
})
