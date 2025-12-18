
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  define: {
    // Isso injeta a variável de ambiente do sistema (Netlify) no código do cliente
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
