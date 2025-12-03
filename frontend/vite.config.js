import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Esto permitirá que Vite escuche en todas las interfaces
    port: 5173,       // Puedes asegurarte de que el puerto sea el 5173
  }
})
