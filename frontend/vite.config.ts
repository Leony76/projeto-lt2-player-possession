import { fileURLToPath, URL } from "node:url";
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // '@'           : path.resolve(__dirname, './src'),
      // '@components' : path.resolve(__dirname, './src/components'),
      // '@assets'     : path.resolve(__dirname, './src/assets'),
      // '@public'     : path.resolve(__dirname, './public'),
      // '@shared'     : path.resolve(__dirname, '../shared'),
      "@"           : fileURLToPath(new URL("./src"            , import.meta.url)),
      "@components" : fileURLToPath(new URL("./src/components" , import.meta.url)),
      "@assets"     : fileURLToPath(new URL("./src/assets"     , import.meta.url)),
      "@public"     : fileURLToPath(new URL("./public"         , import.meta.url)),
      "@shared"     : fileURLToPath(new URL("../shared"        , import.meta.url)),
    },
  },
})
