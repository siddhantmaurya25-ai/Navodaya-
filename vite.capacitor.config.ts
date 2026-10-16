import { resolve } from "node:path";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const projectRoot = process.cwd();

export default defineConfig({
  root: resolve(projectRoot, "capacitor"),
  base: "./",
  publicDir: resolve(projectRoot, "public"),
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), viteReact()],
  build: {
    outDir: resolve(projectRoot, "www"),
    emptyOutDir: true,
  },
});
