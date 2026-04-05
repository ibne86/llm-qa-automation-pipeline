import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./generated-tests",
  timeout: 30000,
  use: {
    headless: true,
    baseURL: "http://127.0.0.1:4173",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },
  reporter: [["html", { outputFolder: "playwright-report", open: "never" }]],
});