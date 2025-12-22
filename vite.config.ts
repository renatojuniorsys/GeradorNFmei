
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  define: {
    // Agora o sistema utiliza estritamente a variável de ambiente fornecida pelo ambiente de execução.
    // Isso evita o erro 403 de "leaked key" ao não expor chaves fixas no código-fonte.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
