import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

const isVercel = Boolean(process.env["VERCEL"]);

export default defineConfig({
  plugins: [
    tanstackStart(),
    nitro(isVercel ? { preset: "vercel" } : {}),
    tailwindcss(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
  ],
});
