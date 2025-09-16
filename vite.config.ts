import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import os from "os";
import fs from "fs";

// Helper to get LAN IP
function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

export default defineConfig(({ command }) => {
  const isDev = command === "serve";
  const localIp = getLocalIp();

  console.log({ localIp });

  return {
    plugins: [
      react(),
      visualizer({
        filename: "dist/stats.html",
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
      sentryVitePlugin({
        org: "skedlii-app",
        project: "javascript-react",
      }),
      {
        name: "vite:eruda-inject",
        transformIndexHtml(html) {
          if (isDev) {
            return html.replace(
              "</body>",
              `<script>
                 (function() {
                   // Enable debug if ?debug in URL
                   if (window.location.search.includes('debug')) {
                     localStorage.setItem('__eruda_debug', 'true');
                   }
                   // Disable debug if ?nodebug in URL
                   if (window.location.search.includes('nodebug')) {
                     localStorage.removeItem('__eruda_debug');
                   }
                   // Load Eruda from CDN if debug is enabled
                   if (localStorage.getItem('__eruda_debug') === 'true') {
                     var s = document.createElement('script');
                     s.src = 'https://cdn.jsdelivr.net/npm/eruda';
                     s.onload = function () {
                       eruda.init({ tool: ['console', 'elements', 'network'] });
                       eruda.position({ x: 20, y: 20 });
                       console.log("🛠 Eruda enabled for mobile debugging");
                     };
                     document.body.appendChild(s);
                   }
                 })();
               </script></body>`
            );
          }
          return html;
        },
      },
    ],
    build: {
      outDir: "dist",
      sourcemap: true,
    },
    server: {
      // host: "0.0.0.0", // allow phone access
      // // port: 5173,
      // proxy: {
      //   "/api": {
      //     target: `http://192.168.1.14:3001`, // use your LAN IP so phone can reach backend
      //     // target: `http://${localIp}:3001`, // use your LAN IP so phone can reach backend
      //     changeOrigin: true,
      //   },
      // },
      // https: {
      //   key: fs.readFileSync("./localhost+2-key.pem"),
      //   cert: fs.readFileSync("./localhost+2.pem"),
      // },
      allowedHosts: ["4d96dbad50d7.ngrok-free.app"],
    },
    assetsInclude: ["**/*.md"],
  };
});
