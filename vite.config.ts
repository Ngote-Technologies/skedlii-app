import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [react(), visualizer({
    filename: "dist/stats.html", // Output location
    open: true, // Auto-open after build
    gzipSize: true, // Show gzip-compressed size
    brotliSize: true, // Show brotli-compressed size
  }), sentryVitePlugin({
    org: "skedlii-app",
    project: "javascript-react"
  })],
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
    port: 5173,
  },
  assetsInclude: ["**/*.md"],
});