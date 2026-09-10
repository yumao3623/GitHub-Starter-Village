import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: ["e2e/**/*.spec.ts", "accessibility/**/*.spec.ts"],
  fullyParallel: true,
  reporter: "html",
  use: { baseURL: process.env.GSV_TEST_URL ?? "http://localhost:3000", trace: "on-first-retry" },
  webServer: {
    command: "npm run dev",
    url: process.env.GSV_TEST_URL ?? "http://localhost:3000",
    reuseExistingServer: true,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
