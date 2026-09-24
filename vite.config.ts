// The Lovable wrapper provides the shared TanStack Start/Vite plugins.
// Vercel builds need Nitro's Vercel preset instead of the wrapper's default
// Cloudflare target. Lovable previews keep their existing target.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isVercel = Boolean(process.env.VERCEL);

export default defineConfig({
  nitro: isVercel ? { preset: "vercel" } : true,
  tanstackStart: {
    server: { entry: "server" },
  },
});
