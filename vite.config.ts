import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  define: {
    // Substitui process.env.API_KEY no código pela chave real durante o build.
    // Usamos a chave fornecida como padrão para evitar o erro de 'missing key'.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || 'AIzaSyCY0Vv8i5WbGhy7igHZDupiLzPWczaJtfo')
  }
})