import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { VitePWA } from "vite-plugin-pwa";
import { manifestoPwaOptions } from "./src/pwa";

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA(manifestoPwaOptions)],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
