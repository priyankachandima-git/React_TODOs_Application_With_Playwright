import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration — ported from the original `cypress.json`.
 *
 *   cypress.json                 -> playwright.config.ts
 *   baseUrl                      -> use.baseURL
 *   viewportWidth/Height         -> use.viewport
 *   defaultCommandTimeout: 9000  -> expect.timeout + use.actionTimeout
 *   retries: 0                   -> retries
 *   video: false                 -> use.video: 'off'
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  reporter: 'html',
  expect: {
    timeout: 9000,
  },
  use: {
    baseURL: 'https://todomvc.com',
    viewport: { width: 1535, height: 877 },
    actionTimeout: 9000,
    video: 'off',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
