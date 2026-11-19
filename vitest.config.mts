import path from "node:path";
import { defineConfig } from "vitest/config";

// Tests use their own SQLite file, rebuilt from the migrations on every run.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: {
    environment: "node",
    env: { DATABASE_URL: "file:./prisma/test.db" },
    globalSetup: "./tests/global-setup.ts",
    setupFiles: ["./tests/setup.ts"],
    // One shared database file: run files one after another.
    fileParallelism: false,
    testTimeout: 20_000,
  },
});
