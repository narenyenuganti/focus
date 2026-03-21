import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3210",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3210",
    env: {
      APP_PASSWORD: "tracker",
      TRACKER_DATA_DIR: ".test-data",
    },
    url: "http://127.0.0.1:3210",
    reuseExistingServer: false,
  },
});
