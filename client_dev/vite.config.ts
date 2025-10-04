import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    host: '0.0.0.0',
    open: true,
  },
});
