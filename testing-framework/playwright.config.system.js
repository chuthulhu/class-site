// playwright.config.js - 시스템 브라우저 사용 버전
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080/class-site',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    // 시스템에 설치된 Chrome 사용 (브라우저 다운로드 불필요)
    {
      name: 'chrome-system',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome' // 시스템 Chrome 사용
      },
    },
    // 시스템에 설치된 Edge 사용
    {
      name: 'edge-system',
      use: { 
        ...devices['Desktop Edge'],
        channel: 'msedge' // 시스템 Edge 사용
      },
    },
    // Firefox는 시스템 버전 사용
    {
      name: 'firefox-system',
      use: { ...devices['Desktop Firefox'] },
    },
    // 모바일 시뮬레이션 (시스템 Chrome 기반)
    {
      name: 'android-chrome-sim',
      use: { 
        ...devices['Pixel 5'],
        channel: 'chrome' // 시스템 Chrome 사용
      },
    },
    {
      name: 'ios-safari-sim',
      use: { 
        ...devices['iPhone 12'],
        channel: 'chrome' // 시스템 Chrome 사용
      },
    },
  ],
  webServer: {
    command: 'npm run start-server',
    url: 'http://localhost:8080/class-site',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});


