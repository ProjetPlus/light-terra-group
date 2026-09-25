import { defineConfig } from "@tanstack/react-start/config/vite";

const isVercel = Boolean(process.env["VERCEL"]);

export default defineConfig({
  nitro: isVercel ? { preset: "vercel" } : true,
  tanstackStart: {
    server: { entry: "server" },
  },
});
