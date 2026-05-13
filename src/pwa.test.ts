import { describe, expect, it } from "vitest";
import { manifestoPwaOptions } from "./pwa";

describe("PWA configuration", () => {
  it("uses a generated Workbox service worker for offline app-shell caching", () => {
    expect(manifestoPwaOptions.strategies).toBe("generateSW");
    expect(manifestoPwaOptions.registerType).toBe("autoUpdate");
    expect(manifestoPwaOptions.workbox?.navigateFallback).toBe("index.html");
    expect(manifestoPwaOptions.workbox?.globPatterns).toContain("**/*.{js,css,html}");
    expect(manifestoPwaOptions.includeAssets).toContain("favicon.svg");
  });

  it("declares installability metadata and local icon assets", () => {
    const manifest = manifestoPwaOptions.manifest;

    expect(manifest).toEqual(
      expect.objectContaining({
        name: "Manifesto Civic Accountability",
        short_name: "Manifesto",
        display: "standalone",
        start_url: "/",
        scope: "/",
        background_color: "#f8fafc",
        theme_color: "#0f766e",
      }),
    );
    expect(manifest && "icons" in manifest ? manifest.icons : []).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/icons/manifesto.svg",
          sizes: "192x192",
          type: "image/svg+xml",
          purpose: "any",
        }),
        expect.objectContaining({
          src: "/icons/manifesto-512.svg",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "any",
        }),
        expect.objectContaining({
          src: "/icons/manifesto-maskable.svg",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "maskable",
        }),
      ]),
    );
  });
});
