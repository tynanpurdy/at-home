import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    cloudflare(),
  ],
  output: "server",
  site: "https://your-domain.com", // Update this with your actual domain

  image: {
    service: {
      entry: "astro/assets/services/noop",
    },
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
