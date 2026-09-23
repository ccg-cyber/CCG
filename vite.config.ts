import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Serving the production build (`vite preview`) behind a reverse proxy
  // on a custom domain — os.cierp.uk — rather than `vite dev`, which is
  // for local development only and was never meant to be exposed
  // publicly (no build optimizations, and its HMR websocket has no way
  // to work through an arbitrary reverse proxy in the first place).
  preview: {
    host: true,
    port: 5173,
    allowedHosts: ["os.cierp.uk"],
  },
});
