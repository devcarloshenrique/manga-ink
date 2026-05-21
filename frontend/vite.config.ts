import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter(), // Gera as rotas tipadas automaticamente
    react(),
    tailwindcss(),    // Compila o Tailwind v4 nativamente
  ],
})