import { defineConfig } from '@playwright/test';

const PORT = 8093;
export default defineConfig({
  testDir: 'tests',
  testMatch: /.*\.spec\.mjs/,
  timeout: 120000,
  expect: { timeout: 15000 },
  fullyParallel: true,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${PORT}/e-rechnung-klartext/`,
    channel: process.env.CI ? undefined : 'chrome',
    acceptDownloads: true,
  },
  webServer: {
    command: `PORT=${PORT} node build/serve.mjs`,
    url: `http://localhost:${PORT}/e-rechnung-klartext/`,
    reuseExistingServer: !process.env.CI,
  },
});
