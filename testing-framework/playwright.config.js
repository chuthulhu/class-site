import { defineConfig, devices } from '@playwright/test';

/**
 * 독립적인 웹앱 호환성 테스트 설정
 * 기존 웹앱에 전혀 영향을 주지 않음
 */
export default defineConfig({
  // 테스트 디렉토리
  testDir: './tests',
  
  // 테스트 실행 설정
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // 리포터 설정
  reporter: [
    ['html', { outputFolder: 'reports/html-report' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['junit', { outputFile: 'reports/test-results.xml' }]
  ],
  
  // 전역 설정
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  // 다양한 환경별 테스트 프로젝트
  projects: [
    // === PC 환경 ===
    {
      name: 'chrome-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'firefox-desktop',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'safari-desktop',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'edge-desktop',
      use: { 
        ...devices['Desktop Edge'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    // === 안드로이드 모바일 ===
    {
      name: 'android-chrome',
      use: { 
        ...devices['Pixel 5'],
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
      },
    },
    {
      name: 'android-samsung',
      use: { 
        ...devices['Galaxy S III'],
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/15.0 Chrome/120.0.0.0 Mobile Safari/537.36'
      },
    },
    {
      name: 'android-naver',
      use: { 
        ...devices['Pixel 5'],
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 NAVER(inapp; search; 1000; 8.10.3; 7.1.2; Android)'
      },
    },

    // === iOS 모바일 ===
    {
      name: 'ios-safari',
      use: { 
        ...devices['iPhone 12'],
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      },
    },
    {
      name: 'ios-chrome',
      use: { 
        ...devices['iPhone 12'],
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1'
      },
    },
    {
      name: 'ios-naver',
      use: { 
        ...devices['iPhone 12'],
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 NAVER(inapp; search; 1000; 8.10.3; 7.1.2; iPhone)'
      },
    },

    // === 태블릿 환경 ===
    {
      name: 'ipad-safari',
      use: { 
        ...devices['iPad Pro'],
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      },
    },
    {
      name: 'android-tablet',
      use: { 
        ...devices['Galaxy Tab S4'],
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-T970) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
    }
  ],

  // 웹 서버 설정 (테스트용 로컬 서버)
  webServer: {
    command: 'cd ../class-site && python -m http.server 8080',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

