import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      "@": path.resolve(__dirname)
    }
  },
  test: {
    environment: "node",
    root: __dirname,
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["**/.claude/**", "**/.next/**", "**/node_modules/**"],
    env: {
      OPENAI_API_KEY: ""
    }
  }
});
