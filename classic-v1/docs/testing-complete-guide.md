# 웹앱 환경별 테스트 완전 가이드

## 🎯 개요

과학탐구실험 웹앱이 다양한 디바이스 및 브라우저 환경에서 정상 작동하는지 확인하기 위한 포괄적인 테스트 가이드입니다. 자동화된 테스트와 수동 테스트 방법을 모두 다룹니다.

## 🚀 빠른 시작

### 자동화된 테스트 (권장)
```bash
# 테스트 프레임워크 설정
cd testing-framework
npm install
npx playwright install --with-deps

# 전체 환경 테스트 실행
npm run test:all

# 결과 확인
npm run test:report
```

### 수동 테스트
```bash
# 브라우저 개발자 도구 활용
# Chrome: F12 → Device Toolbar (Ctrl+Shift+M)
# 다양한 디바이스 시뮬레이션으로 테스트
```

## 📱 환경별 테스트

### 🖥️ 데스크톱 브라우저

#### 지원 브라우저
- **Chrome** (Windows, macOS, Linux)
- **Firefox** (Windows, macOS, Linux)
- **Safari** (macOS)
- **Edge** (Windows, macOS)

#### 테스트 항목
```bash
✅ 페이지 로딩 (3초 이내)
✅ 탭 네비게이션
✅ 폼 입력 및 검증
✅ 실시간 미리보기
✅ 파일 다운로드
✅ PDF 저장
✅ 반응형 레이아웃
```

#### 자동화 테스트 명령어
```bash
# 개별 브라우저 테스트
npx playwright test --project=chrome-desktop
npx playwright test --project=firefox-desktop
npx playwright test --project=safari-desktop
npx playwright test --project=edge-desktop

# 모든 데스크톱 브라우저
npm run test:desktop
```

### 📱 모바일 브라우저

#### 지원 환경
- **Android**: Chrome, Samsung Browser, Firefox
- **iOS**: Safari, Chrome, Firefox
- **인앱 브라우저**: Naver, KakaoTalk, Instagram, Facebook

#### 테스트 항목
```bash
✅ 터치 네비게이션
✅ 모바일 키보드 입력
✅ 스크롤 동작
✅ 버튼 터치 반응
✅ 반응형 레이아웃
✅ 모바일 다운로드 처리
✅ 인앱 브라우저 호환성
```

#### 자동화 테스트 명령어
```bash
# 개별 모바일 환경 테스트
npx playwright test --project=android-chrome
npx playwright test --project=ios-safari
npx playwright test --project=samsung-browser
npx playwright test --project=naver-inapp

# 모든 모바일 환경
npm run test:mobile
```

### 📱 태블릿 환경

#### 지원 환경
- **iPad**: Safari, Chrome
- **Android 태블릿**: Chrome, Samsung Browser

#### 테스트 항목
```bash
✅ 태블릿 최적화 레이아웃
✅ 터치 인터페이스
✅ 큰 화면에서의 가독성
✅ 회전 대응
```

## 🔧 기능별 상세 테스트

### A. 폼 입력 테스트

#### 테스트 데이터
```javascript
// 학생 정보
학년: 2
반: 5
번호: 12
이름: 홍길동

// 기사 정보 (물리학II 예시)
공학분야: 양자공학
기사 제목: "양자컴퓨터 기술 발전"
기사 요약: "양자 중첩 원리를 이용한..."
언론사: 조선일보
날짜: 2024.03.15
URL: https://example.com
```

#### 검증 항목
- 입력 필드 정상 작동
- 유효성 검사 동작
- 실시간 미리보기 업데이트
- 자동 저장 기능

### B. 파일 생성 및 다운로드

#### 테스트 시나리오
1. **ZIP 생성 테스트**
   - 파일명 규칙 확인
   - 용량 제한 확인 (8MB)
   - 압축 품질 확인

2. **다운로드 테스트**
   - 일반 브라우저: 직접 다운로드
   - iOS Safari: 공유 시트
   - 인앱 브라우저: 서버 다운로드

3. **업로드 테스트**
   - OneDrive 업로드 성공
   - 진행률 표시
   - 오류 처리

### C. 반응형 디자인

#### 브레이크포인트 테스트
```css
/* 모바일 */
@media (max-width: 768px) { ... }

/* 태블릿 */
@media (min-width: 769px) and (max-width: 1024px) { ... }

/* 데스크톱 */
@media (min-width: 1025px) { ... }
```

#### 테스트 항목
- 레이아웃 적응성
- 폰트 크기 조정
- 버튼 크기 최적화
- 네비게이션 메뉴

## 🛠️ 수동 테스트 방법

### Chrome DevTools 활용

#### 1. 디바이스 시뮬레이션
```bash
# Chrome 열기 → F12 → Device Toolbar (Ctrl+Shift+M)
# 디바이스 선택:
- iPhone 12 Pro (375x667)
- Galaxy S20 (360x800)
- iPad (768x1024)
- Desktop (1920x1080)
```

#### 2. 네트워크 시뮬레이션
```bash
# Network 탭에서:
- Slow 3G: 느린 연결 테스트
- Offline: 오프라인 모드 테스트
- Custom: 사용자 정의 속도
```

#### 3. 성능 분석
```bash
# Performance 탭에서:
- 페이지 로딩 시간 측정
- 메모리 사용량 확인
- 렌더링 성능 분석
```

### 실제 디바이스 테스트

#### Android 디바이스
1. Chrome 앱에서 사이트 접속
2. 주요 기능 테스트
3. 터치 인터페이스 확인
4. 다운로드 기능 테스트

#### iOS 디바이스
1. Safari 앱에서 사이트 접속
2. 터치 인터페이스 확인
3. 공유 시트 기능 테스트
4. 파일 저장 확인

## 📊 테스트 결과 분석

### 성공 기준
```bash
✅ 모든 주요 브라우저에서 정상 작동
✅ 모바일/태블릿에서 반응형 레이아웃 유지
✅ 로딩 시간 5초 이내
✅ 폼 입력 및 미리보기 정상
✅ 파일 다운로드 정상
✅ 오류율 1% 이하
```

### 성능 지표
- **로딩 시간**: 데스크톱 2-3초, 모바일 3-4초
- **메모리 사용량**: 초기 15MB, 작업 중 25MB
- **파일 크기**: HTML 50KB, ZIP 15-30KB

### 문제 발견 시
1. **스크린샷** 촬영
2. **브라우저 콘솔** 에러 확인
3. **네트워크 탭** 요청/응답 확인
4. **문제 상황** 상세 기록

## 🔄 자동화 테스트 프레임워크

### Playwright 설정
```javascript
// playwright.config.js
export default defineConfig({
  projects: [
    // 데스크톱 브라우저
    { name: 'chrome-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'] } },
    { name: 'safari-desktop', use: { ...devices['Desktop Safari'] } },
    { name: 'edge-desktop', use: { ...devices['Desktop Edge'] } },
    
    // 모바일 브라우저
    { name: 'android-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'ios-safari', use: { ...devices['iPhone 12'] } },
    { name: 'samsung-browser', use: { ...devices['Galaxy S III'] } },
    { name: 'naver-inapp', use: { ...devices['iPhone 12'] } },
    
    // 태블릿
    { name: 'ipad-safari', use: { ...devices['iPad (gen 7)'] } },
    { name: 'android-tablet', use: { ...devices['Galaxy Tab S4'] } },
  ],
});
```

### 테스트 실행 명령어
```bash
# 전체 테스트
npm run test:all

# 환경별 테스트
npm run test:desktop
npm run test:mobile

# 개별 브라우저 테스트
npx playwright test --project=chrome-desktop

# UI 모드 (대화형)
npx playwright test --ui

# 디버그 모드
npx playwright test --debug
```

### CI/CD 통합
```yaml
# .github/workflows/test.yml
name: Cross-Platform Testing
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test:all
```

## 🚨 문제 해결

### 일반적인 문제

#### 1. Playwright 브라우저 설치 실패
```bash
# 해결 방법
npm config set strict-ssl false
set NODE_TLS_REJECT_UNAUTHORIZED=0
npx playwright install --with-deps

# 또는 시스템 브라우저 사용
# playwright.config.js에서 channel: 'chrome' 설정
```

#### 2. 테스트 타임아웃
```bash
# 해결 방법
# playwright.config.js에서 timeout 증가
use: {
  timeout: 60000, // 60초
}
```

#### 3. 요소 찾기 실패
```bash
# 해결 방법
# 더 안정적인 셀렉터 사용
await page.waitForSelector('[data-testid="submit-button"]')
await page.click('[data-testid="submit-button"]')
```

### 브라우저별 문제

#### Chrome
- **문제**: 폰트 렌더링 차이
- **해결**: CSS 최적화, 폰트 로딩 개선

#### Firefox
- **문제**: 일부 CSS 속성 미지원
- **해결**: 벤더 프리픽스 추가, 폴백 제공

#### Safari
- **문제**: 파일 다운로드 제한
- **해결**: 공유 시트 활용, 서버 다운로드

#### 모바일 브라우저
- **문제**: 터치 이벤트 지연
- **해결**: 터치 최적화, 제스처 개선

## 📈 테스트 개선 방안

### 1. 테스트 커버리지 확대
- [ ] 접근성 테스트 추가
- [ ] 보안 테스트 강화
- [ ] 성능 테스트 정교화

### 2. 자동화 확대
- [ ] 시각적 회귀 테스트
- [ ] API 테스트 자동화
- [ ] 성능 모니터링

### 3. 사용자 피드백 통합
- [ ] 실제 사용자 테스트
- [ ] 피드백 수집 시스템
- [ ] 지속적 개선

## 📚 관련 문서

### 테스트 프레임워크
- [Playwright 공식 문서](https://playwright.dev/)
- [테스트 프레임워크 README](../testing-framework/README.md)

### 문제 해결
- [Playwright 문제 해결](PLAYWRIGHT_TROUBLESHOOTING.md)
- [물리학II 테스트 결과](PHYSICS2_TEST_RESULTS.md)

### 개발 가이드
- [API 문서](../project/api.md)
- [배포 가이드](../project/deployment.md)

---

**마지막 업데이트**: 2025-10-15  
**버전**: 1.3.0  
**상태**: 운영 중



