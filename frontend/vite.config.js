import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/chat': 'http://localhost:5050',
      '/get-token': 'http://localhost:5050',
      '/conversation': 'http://localhost:5050',
      '/clear-conversation': 'http://localhost:5050',
      '/static': 'http://localhost:5050'
    }
  }
})