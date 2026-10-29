import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@'           : path.resolve(__dirname, './src'),
      '@components' : path.resolve(__dirname, './src/components'),
      '@assets'     : path.resolve(__dirname, './src/assets'),
      '@public'     : path.resolve(__dirname, './public')
    },
  },
})
