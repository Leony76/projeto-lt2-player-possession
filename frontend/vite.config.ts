import { fileURLToPath, URL } from "node:url";
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@"           : fileURLToPath(new URL("./src"            , import.meta.url)),
      "@components" : fileURLToPath(new URL("./src/components" , import.meta.url)),
      "@assets"     : fileURLToPath(new URL("./src/assets"     , import.meta.url)),
      "@public"     : fileURLToPath(new URL("./public"         , import.meta.url)),
      "@shared"     : fileURLToPath(new URL("../shared"        , import.meta.url)),
      "@backend"    : fileURLToPath(new URL("../backend"       , import.meta.url)),
    },
  },
})
