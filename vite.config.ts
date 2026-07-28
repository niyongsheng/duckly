import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Duckly - Cartoon Schedule",
        short_name: "Duckly",
        description: "A cute cartoon schedule web app",
        theme_color: "#FFF8F0",
        background_color: "#FFF8F0",
        display: "standalone",
        icons: [
          { src: "/icons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
});
