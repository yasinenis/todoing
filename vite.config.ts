import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "TodoIng — Görevler, Hedefler, Alışkanlıklar",
        short_name: "TodoIng",
        description:
          "Görevlerini, hedeflerini ve alışkanlıklarını tek yerde topla; her gün motive ol.",
        theme_color: "#a78bfa",
        background_color: "#faf8ff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        lang: "tr",
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("@supabase")) return "supabase";
          if (
            id.includes("react") ||
            id.includes("@radix-ui") ||
            id.includes("@tanstack")
          )
            return "vendor";
        },
      },
    },
  },
});
