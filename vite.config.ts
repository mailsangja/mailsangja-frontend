import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { paraglideVitePlugin } from "@inlang/paraglide-js"
import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return
          }

          if (id.includes("node_modules/@react-email/editor")) {
            return "react-email-editor"
          }

          if (id.includes("node_modules/@tiptap")) {
            return "tiptap-editor"
          }

          if (id.includes("node_modules/@react-email")) {
            return "react-email-renderer"
          }
        },
      },
    },
  },
  plugins: [
    tanstackStart({
      spa: {
        enabled: true,
        // GitHub Pages serves 404.html as the SPA fallback.
        maskPath: "/404",
        prerender: {
          outputPath: "/404",
        },
      },
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: false,
        crawlLinks: false,
        failOnError: true,
      },
      pages: [
        {
          path: "/",
          prerender: {
            enabled: true,
          },
        },
        {
          path: "/terms",
          prerender: {
            enabled: true,
          },
        },
        {
          path: "/privacy",
          prerender: {
            enabled: true,
          },
        },
      ],
    }),
    react(),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/paraglide",
      strategy: ["localStorage", "preferredLanguage", "baseLocale"],
    }),
    tailwindcss(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "prompt",
      injectRegister: false,
      manifest: {
        name: "메일상자",
        short_name: "메일상자",
        description: "AI 기반 다중 계정 인박스 관리 자동화 서비스",
        lang: "ko",
        theme_color: "#faf9f5",
        background_color: "#faf9f5",
        display: "standalone",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
