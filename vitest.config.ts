import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    exclude: ["tests/e2e/**", "node_modules/**"],
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: { reporter: ["text", "html"] },
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
