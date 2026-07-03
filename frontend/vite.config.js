import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy is only used during local development (vite dev server)
    // In production (Vercel), VITE_API_URL points directly to the Render backend
    proxy: {
      '/api': {
        target: process.env.BACKEND_PROXY_URL || 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
