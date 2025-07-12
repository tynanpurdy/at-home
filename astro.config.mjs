import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import atProtoCachePlugin from "./vite-cache-plugin.js";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
  ],
  output: "static",
  site: "https://your-domain.com", // Update this with your actual domain
  vite: {
    plugins: [atProtoCachePlugin()],
    build: {
      rollupOptions: {
        external: ["fs", "path", "url"],
      },
    },
  },
  image: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.bsky.app",
      },
      {
        protocol: "https",
        hostname: "*.atproto.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.bsky.app",
      },
    ],
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
});
