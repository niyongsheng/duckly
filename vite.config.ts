import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const base = process.env.VITE_BASE_URL || "/";

export default defineConfig({
  base,
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Preserve original name so the SQLite worker can find sqlite3.wasm
          if (assetInfo.name === "sqlite3.wasm") {
            return "assets/[name][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "favicon.svg",
        "icons/*.png",
      ],
      manifest: {
        name: "Duckly - manage your everyday",
        short_name: "Duckly",
        description: "一款精美的日程管理 Web 应用，支持离线使用",
        lang: "zh-CN",
        start_url: base,
        scope: base,
        display: "standalone",
        theme_color: "#FFF8F0",
        background_color: "#FFF8F0",
        categories: ["productivity", "utilities"],
        icons: [
          {
            src: "icons/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,wasm,ico,png,svg,webmanifest}"],
        runtimeCaching: [
          {
            // 缓存 Google Fonts 样式表
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-css",
              expiration: {
                maxEntries: 4,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 年
              },
            },
          },
          {
            // 缓存 Google Fonts 字体文件
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 8,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 年
              },
            },
          },
        ],
      },
    }),
  ],
});
