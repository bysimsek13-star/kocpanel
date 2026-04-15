import { defineConfig, devices } from '@playwright/test';

// CI'da BASE_URL üretim URL'sine işaret eder; yerelde localhost:4173 kullanılır.
const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';
const IS_REMOTE = BASE_URL.startsWith('https://');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: IS_REMOTE ? 2 : 1,
  workers: 1,
  reporter: 'html',
  timeout: IS_REMOTE ? 45000 : 30000,
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
  // webServer yalnızca lokal çalışmada (BASE_URL https değilken) başlatılır
  ...(IS_REMOTE
    ? {}
    : {
        webServer: {
          command: 'npx vite preview --port 4173',
          url: 'http://localhost:4173',
          reuseExistingServer: false,
          timeout: 60000,
        },
      }),
});
