import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

const SYSTEM_CHROMIUM = '/usr/bin/chromium';

// Prefer an explicit CHROMIUM_PATH (Alpine's apk build), then a system install,
// then fall back to Playwright's managed browser on GitHub Actions.
function resolveChromiumPath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  if (existsSync(SYSTEM_CHROMIUM)) return SYSTEM_CHROMIUM;
  return undefined;
}

const PORT = Number(process.env.PORT || 4173);
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;

const launchOptions = {
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
};

const CHROMIUM_PATH = resolveChromiumPath();
if (CHROMIUM_PATH) launchOptions.executablePath = CHROMIUM_PATH;

export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  use: {
    baseURL: BASE_URL,
    actionTimeout: 5_000,
    navigationTimeout: 15_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions
      }
    }
  ],
  webServer: {
    command: `node tests/server.js`,
    url: `${BASE_URL}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
