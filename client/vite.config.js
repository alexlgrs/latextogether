import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/temp': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/yjs': {
        target: 'http://localhost:1234',
        ws: true, // Active le support WebSocket
        changeOrigin: true,
      },
    },
    allowedHosts: true
  },
})