import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
const usePolling = process.env.VITE_USE_POLLING === 'true'

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],

  envPrefix: 'VITE_',

  server: {
    watch: {
      usePolling,
      ...(usePolling
        ? {
            interval: 500,
            awaitWriteFinish: {
              stabilityThreshold: 500,
              pollInterval: 100,
            },
          }
        : {}),
      ignored: ['**/dist/**'],
    },
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})