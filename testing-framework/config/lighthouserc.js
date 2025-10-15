module.exports = {
  ci: {
    collect: {
      // 테스트할 URL들
      url: [
        'http://localhost:8080/',
        'http://localhost:8080/science-experiments/',
        'http://localhost:8080/science-experiments/suhaeng1/',
        'http://localhost:8080/science-experiments/suhaeng2/',
        'http://localhost:8080/science-experiments/suhaeng3/',
        'http://localhost:8080/physics2/',
        'http://localhost:8080/physics2/activity2/'
      ],
      // 다양한 디바이스 시뮬레이션
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        // 모바일 시뮬레이션
        emulatedFormFactor: 'mobile',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4
        }
      },
      // 데스크톱 테스트도 추가
      numberOfRuns: 3
    },
    assert: {
      // 성능 기준 설정
      assertions: {
        'categories:performance': ['error', {minScore: 0.7}],
        'categories:accessibility': ['error', {minScore: 0.8}],
        'categories:best-practices': ['warn', {minScore: 0.8}],
        'categories:seo': ['warn', {minScore: 0.7}],
        // 특정 메트릭 기준
        'first-contentful-paint': ['warn', {maxNumericValue: 2000}],
        'largest-contentful-paint': ['warn', {maxNumericValue: 4000}],
        'cumulative-layout-shift': ['warn', {maxNumericValue: 0.1}],
        'total-blocking-time': ['warn', {maxNumericValue: 300}]
      }
    },
    upload: {
      // 결과를 GitHub Pages에 업로드 (선택사항)
      target: 'temporary-public-storage'
    }
  }
};

