import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/nightbus-dev/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://server.nightbusjourney.com',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://server.nightbusjourney.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
