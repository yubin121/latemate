import { defineConfig } from '@playwright/test'

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.artifacts/test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: './e2e/.artifacts/report', open: 'never' }]]
    : [['list'], ['html', { outputFolder: './e2e/.artifacts/report', open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    permissions: ['geolocation'],
    geolocation: { latitude: 37.4979, longitude: 127.0276 },
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  projects: [
    { name: 'mobile-chromium', use: { browserName: 'chromium' } },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      VITE_SUPABASE_URL: 'https://e2e.supabase.test',
      VITE_SUPABASE_ANON_KEY: 'e2e-anon-key',
      VITE_KAKAO_MAP_KEY: 'e2e-kakao-key',
      VITE_KAKAO_REST_API_KEY: 'e2e-kakao-rest',
    },
  },
})
