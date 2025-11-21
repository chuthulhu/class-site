# 웹앱 호환성 테스트 프레임워크

## 🎯 개요

이 프레임워크는 기존 웹앱 문서에 **전혀 영향을 주지 않으면서** 다양한 환경에서의 호환성을 자동으로 테스트하는 독립적인 시스템입니다.

## 🏗️ 구조

```
testing-framework/
├── tests/                    # 테스트 스크립트
│   ├── compatibility.spec.js # 기본 호환성 테스트
│   └── functionality.spec.js # 기능별 상세 테스트
├── config/                   # 설정 파일
│   └── lighthouserc.js      # Lighthouse 성능 테스트 설정
├── scripts/                  # 유틸리티 스크립트
│   ├── run-tests.sh         # 테스트 실행 스크립트
│   └── generate-report.js   # 리포트 생성 스크립트
├── reports/                  # 테스트 결과
│   ├── html-report/         # Playwright HTML 리포트
│   ├── lighthouse/          # Lighthouse 성능 리포트
│   └── comprehensive/       # 통합 리포트
├── playwright.config.js     # Playwright 설정
├── package.json             # 의존성 및 스크립트
└── .github/workflows/       # GitHub Actions 워크플로우
```

## 🌐 지원 환경

### 데스크톱 브라우저
- Chrome (Windows, macOS, Linux)
- Firefox (Windows, macOS, Linux)
- Safari (macOS)
- Edge (Windows)

### 모바일 브라우저
- Android Chrome
- Android Samsung Browser
- iOS Safari
- iOS Chrome
- 네이버 인앱 브라우저 (시뮬레이션)

### 태블릿
- iPad Safari
- Android Tablet

## 🚀 사용 방법

### 1. 설치

```bash
cd testing-framework
npm install
npx playwright install --with-deps
```

### 2. 테스트 실행

```bash
# 전체 테스트
npm run test:all

# 데스크톱만 테스트
npm run test:desktop

# 모바일만 테스트
npm run test:mobile

# 성능 테스트만
npm run lighthouse

# 특정 브라우저만 테스트
npx playwright test --project=chrome-desktop
```

### 3. 스크립트 사용

```bash
# Linux/macOS
./scripts/run-tests.sh all

# Windows (PowerShell)
node scripts/run-tests.js all
```

## 📊 테스트 항목

### 기본 호환성 테스트
- ✅ 페이지 로딩 및 기본 구조
- ✅ 네비게이션 메뉴 동작
- ✅ 링크 동작 확인
- ✅ 반응형 레이아웃
- ✅ 폼 요소 동작
- ✅ 이미지 로딩
- ✅ JavaScript 에러 확인

### 기능별 테스트
- ✅ 세션 선택 기능
- ✅ 파일 업로드
- ✅ 폼 입력 및 제출
- ✅ 모바일 터치 인터랙션
- ✅ API 호출 테스트
- ✅ 오프라인 모드
- ✅ 쿠키 및 로컬 스토리지

### 성능 테스트
- ✅ 페이지 로딩 시간
- ✅ First Contentful Paint
- ✅ Largest Contentful Paint
- ✅ Cumulative Layout Shift
- ✅ Total Blocking Time

### 접근성 테스트
- ✅ 키보드 네비게이션
- ✅ 스크린 리더 호환성
- ✅ 색상 대비
- ✅ ARIA 라벨

## 🔧 설정

### Playwright 설정 (`playwright.config.js`)
- 다양한 환경별 프로젝트 정의
- 자동 스크린샷 및 비디오 캡처
- 커스텀 리포터 설정

### Lighthouse 설정 (`config/lighthouserc.js`)
- 성능 기준 설정
- 다양한 디바이스 시뮬레이션
- 자동 리포트 생성

## 📈 리포트

### 자동 생성되는 리포트
1. **Playwright HTML 리포트**: 상세한 테스트 결과
2. **Lighthouse 성능 리포트**: 성능 메트릭 분석
3. **통합 리포트**: 모든 테스트 결과 종합

### 리포트 위치
- `reports/html-report/`: Playwright 리포트
- `reports/lighthouse/`: Lighthouse 리포트
- `reports/comprehensive/`: 통합 리포트

## 🔄 CI/CD 통합

### GitHub Actions
- 코드 푸시 시 자동 테스트 실행
- 다양한 환경에서 병렬 테스트
- 테스트 결과 자동 업로드
- 실패 시 알림

### 스케줄링
- 매일 오전 6시 자동 테스트
- 수동 테스트 실행 가능

## 🛡️ 안전성

### 기존 웹앱 보호
- ✅ 완전히 독립적인 테스트 환경
- ✅ 기존 코드 수정 없음
- ✅ 별도 포트 사용 (8080)
- ✅ 테스트 데이터만 사용

### 격리된 테스트
- ✅ 로컬 서버에서만 테스트
- ✅ 실제 사용자 데이터 접근 없음
- ✅ 프로덕션 환경 영향 없음

## 🎛️ 고급 사용법

### 커스텀 테스트 추가
```javascript
// tests/custom.spec.js
import { test, expect } from '@playwright/test';

test('커스텀 테스트', async ({ page }) => {
  await page.goto('/');
  // 커스텀 테스트 로직
});
```

### 환경별 설정 커스터마이징
```javascript
// playwright.config.js에서 프로젝트 추가
{
  name: 'custom-environment',
  use: { 
    ...devices['Desktop Chrome'],
    // 커스텀 설정
  },
}
```

## 🐛 문제 해결

### 일반적인 문제
1. **포트 충돌**: 다른 포트 사용하도록 설정 변경
2. **브라우저 설치 실패**: `npx playwright install --with-deps` 재실행
3. **권한 문제**: 스크립트 실행 권한 확인

### 로그 확인
- 테스트 실행 로그: 콘솔 출력
- 상세 로그: `reports/` 디렉토리
- GitHub Actions 로그: Actions 탭

## 📞 지원

문제가 발생하거나 개선 사항이 있으면 이슈를 등록해주세요.

---
*이 프레임워크는 기존 웹앱의 안정성을 보장하면서 호환성을 검증합니다.*

