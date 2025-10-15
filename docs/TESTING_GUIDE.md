# 웹앱 환경별 테스트 가이드

## 🎯 **테스트 환경 개요**

웹앱이 다양한 환경에서 정상 작동하는지 확인하기 위한 포괄적인 테스트 방법을 안내합니다.

## 📱 **1. 디바이스별 테스트**

### **A. 데스크톱 환경**
```bash
# Windows 환경
- Chrome (최신 버전)
- Firefox (최신 버전)  
- Edge (최신 버전)
- Safari (macOS에서만)

# macOS 환경
- Safari (네이티브)
- Chrome
- Firefox

# Linux 환경
- Chrome/Chromium
- Firefox
```

### **B. 모바일 환경**
```bash
# Android 디바이스
- Chrome (기본 브라우저)
- Samsung Internet
- Firefox Mobile
- 네이버 앱 내 브라우저

# iOS 디바이스  
- Safari (네이티브)
- Chrome for iOS
- Firefox for iOS
- 네이버 앱 내 브라우저
```

### **C. 태블릿 환경**
```bash
# iPad
- Safari
- Chrome for iPad

# Android 태블릿
- Chrome
- Samsung Internet
```

## 🔧 **2. 자동화된 테스트 방법**

### **A. Playwright를 이용한 자동 테스트**

#### **설치 및 설정**
```bash
cd testing-framework
npm install
npx playwright install --with-deps
```

#### **전체 환경 테스트**
```bash
# 모든 환경에서 테스트
npm run test:all

# 데스크톱만 테스트
npm run test:desktop

# 모바일만 테스트  
npm run test:mobile

# 특정 브라우저만 테스트
npx playwright test --project=chrome-desktop
npx playwright test --project=android-chrome
npx playwright test --project=ios-safari
```

#### **테스트 결과 확인**
```bash
# HTML 리포트 보기
npm run test:report

# 브라우저에서 직접 테스트
npm run test:ui
```

### **B. GitHub Actions 자동 테스트**

#### **자동 실행 조건**
- 코드 푸시 시
- Pull Request 생성 시
- 매일 오전 6시 정기 실행
- 수동 실행 가능

#### **테스트 환경 매트릭스**
```yaml
strategy:
  matrix:
    project: [
      'chrome-desktop',
      'firefox-desktop', 
      'safari-desktop',
      'android-chrome',
      'android-samsung',
      'ios-safari',
      'ios-chrome',
      'ipad-safari'
    ]
```

## 🖥️ **3. 수동 테스트 방법**

### **A. 브라우저 개발자 도구 활용**

#### **Chrome DevTools**
```javascript
// 콘솔에서 환경 정보 확인
console.log({
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  screenSize: `${screen.width}x${screen.height}`,
  viewportSize: `${window.innerWidth}x${window.innerHeight}`,
  devicePixelRatio: window.devicePixelRatio
});

// 네트워크 탭에서 요청/응답 확인
// Performance 탭에서 성능 측정
// Lighthouse 탭에서 접근성/성능 점수 확인
```

#### **Firefox Developer Tools**
```javascript
// 반응형 디자인 모드
// Ctrl+Shift+M (Windows/Linux)
// Cmd+Opt+M (macOS)

// 다양한 디바이스 시뮬레이션
// iPhone, iPad, Galaxy 등
```

### **B. 실제 디바이스 테스트**

#### **Android 디바이스**
```bash
# Chrome 원격 디버깅
1. USB 디버깅 활성화
2. chrome://inspect 접속
3. 디바이스 연결 후 테스트

# Samsung Internet
1. 삼성 브라우저에서 테스트
2. 네이버 앱 내 브라우저 테스트
```

#### **iOS 디바이스**
```bash
# Safari 웹 인스펙터
1. 설정 > Safari > 고급 > 웹 인스펙터 활성화
2. Mac Safari에서 개발자 메뉴 사용
3. 디바이스 연결 후 테스트
```

## 📊 **4. 테스트 항목별 체크리스트**

### **A. 기본 기능 테스트**
- [ ] 페이지 로딩 (3초 이내)
- [ ] 네비게이션 메뉴 동작
- [ ] 링크 클릭 동작
- [ ] 폼 입력 및 제출
- [ ] 파일 업로드/다운로드
- [ ] 이미지 표시
- [ ] 동영상 재생

### **B. 반응형 테스트**
- [ ] 데스크톱 (1920x1080)
- [ ] 태블릿 (768x1024)
- [ ] 모바일 (375x667)
- [ ] 가로/세로 모드 전환
- [ ] 줌 인/아웃 (50%-200%)

### **C. 성능 테스트**
- [ ] First Contentful Paint < 2초
- [ ] Largest Contentful Paint < 4초
- [ ] Cumulative Layout Shift < 0.1
- [ ] Total Blocking Time < 300ms
- [ ] 메모리 사용량 < 100MB

### **D. 접근성 테스트**
- [ ] 키보드 네비게이션
- [ ] 스크린 리더 호환성
- [ ] 색상 대비 (4.5:1 이상)
- [ ] ARIA 라벨 적용
- [ ] 포커스 표시

### **E. 네트워크 테스트**
- [ ] 빠른 연결 (WiFi)
- [ ] 느린 연결 (3G)
- [ ] 오프라인 모드
- [ ] 네트워크 끊김 복구

## 🛠️ **5. 테스트 도구 및 서비스**

### **A. 온라인 테스트 도구**
```bash
# BrowserStack (유료)
- 실제 디바이스에서 테스트
- 다양한 OS/브라우저 조합
- 자동 스크린샷 비교

# Sauce Labs (유료)  
- 클라우드 기반 테스트
- CI/CD 통합
- 실시간 테스트 모니터링

# CrossBrowserTesting (유료)
- 다양한 브라우저 테스트
- 자동화된 테스트 실행
- 성능 분석
```

### **B. 무료 도구**
```bash
# WebPageTest
- 성능 테스트
- 다양한 위치에서 테스트
- 상세한 분석 리포트

# Lighthouse CI
- 성능/접근성 자동 검사
- CI/CD 통합
- 점수 기준 설정

# axe-core
- 접근성 자동 검사
- CLI 도구 제공
- CI/CD 통합 가능
```

## 📋 **6. 테스트 실행 순서**

### **A. 개발 단계**
```bash
1. 로컬 개발 서버에서 기본 테스트
2. Playwright로 자동 테스트 실행
3. 주요 브라우저에서 수동 확인
4. 모바일 시뮬레이션 테스트
```

### **B. 배포 전 단계**
```bash
1. GitHub Actions 자동 테스트 실행
2. 실제 디바이스에서 테스트
3. 성능 및 접근성 검사
4. 다양한 네트워크 환경 테스트
```

### **C. 배포 후 단계**
```bash
1. 프로덕션 환경에서 최종 확인
2. 사용자 피드백 수집
3. 에러 모니터링 (Sentry 등)
4. 성능 모니터링
```

## 🚨 **7. 문제 해결 가이드**

### **A. 일반적인 문제들**
```bash
# CORS 에러
- 프록시 서버 사용
- 서버 측 CORS 헤더 설정
- JSONP 방식 활용

# 레이아웃 깨짐
- CSS 미디어 쿼리 확인
- Flexbox/Grid 호환성 확인
- 브라우저별 CSS 벤더 프리픽스

# JavaScript 에러
- 브라우저 콘솔 확인
- 폴리필 추가
- ES6+ 문법 호환성 확인
```

### **B. 디버깅 방법**
```javascript
// 환경별 조건부 실행
if (navigator.userAgent.includes('Chrome')) {
  // Chrome 전용 코드
} else if (navigator.userAgent.includes('Safari')) {
  // Safari 전용 코드
}

// 기능 감지
if ('serviceWorker' in navigator) {
  // Service Worker 지원
}

if ('touchstart' in window) {
  // 터치 이벤트 지원
}
```

## 📈 **8. 테스트 결과 분석**

### **A. 성공 기준**
- 모든 주요 브라우저에서 정상 작동
- 모바일/태블릿에서 반응형 레이아웃 유지
- 성능 점수 80점 이상
- 접근성 점수 90점 이상
- CORS 에러 없음

### **B. 개선 사항**
- 실패한 테스트 케이스 분석
- 성능 병목 지점 식별
- 접근성 문제 해결
- 브라우저별 호환성 개선

## 🎯 **9. 권장 테스트 주기**

- **개발 중**: 코드 변경 시마다
- **배포 전**: 반드시 전체 테스트
- **배포 후**: 1주일간 모니터링
- **정기적**: 월 1회 전체 점검

이 가이드를 따라하면 웹앱이 다양한 환경에서 안정적으로 작동할 수 있습니다! 🚀
