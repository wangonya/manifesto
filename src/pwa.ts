import type { VitePWAOptions } from "vite-plugin-pwa";

export const manifestoPwaOptions = {
  registerType: "autoUpdate",
  injectRegister: "script-defer",
  strategies: "generateSW",
  includeAssets: ["favicon.svg"],
  manifest: {
    name: "Manifesto Civic Accountability",
    short_name: "Manifesto",
    description: "Offline-first civic accountability for trackable public commitments.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#0f766e",
    lang: "en",
    icons: [
      {
        src: "/icons/manifesto.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/manifesto-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/manifesto-maskable.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  },
  workbox: {
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: true,
    globPatterns: ["**/*.{js,css,html}"],
    navigateFallback: "index.html",
  },
} satisfies Partial<VitePWAOptions>;
