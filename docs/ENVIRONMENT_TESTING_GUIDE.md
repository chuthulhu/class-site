# 웹앱 환경별 테스트 실행 가이드

## 🚀 **빠른 시작**

### **1. 자동화된 테스트 실행**
```bash
# 테스트 프레임워크 디렉토리로 이동
cd testing-framework

# 의존성 설치 (최초 1회만)
npm install
npx playwright install --with-deps

# 전체 환경 테스트 실행
npm run test:all
```

### **2. 테스트 결과 확인**
```bash
# HTML 리포트 보기
npm run test:report

# 브라우저에서 직접 테스트 (UI 모드)
npm run test:ui
```

## 📱 **환경별 테스트 방법**

### **A. 데스크톱 브라우저 테스트**
```bash
# Chrome 데스크톱
npx playwright test --project=chrome-desktop

# Firefox 데스크톱  
npx playwright test --project=firefox-desktop

# Safari 데스크톱 (macOS만)
npx playwright test --project=safari-desktop

# Edge 데스크톱
npx playwright test --project=edge-desktop

# 모든 데스크톱 브라우저
npm run test:desktop
```

### **B. 모바일 브라우저 테스트**
```bash
# Android Chrome
npx playwright test --project=android-chrome

# Android Samsung Browser
npx playwright test --project=android-samsung

# iOS Safari
npx playwright test --project=ios-safari

# iOS Chrome
npx playwright test --project=ios-chrome

# 네이버 인앱 브라우저
npx playwright test --project=android-naver
npx playwright test --project=ios-naver

# 모든 모바일 브라우저
npm run test:mobile
```

### **C. 태블릿 테스트**
```bash
# iPad Safari
npx playwright test --project=ipad-safari

# Android 태블릿
npx playwright test --project=android-tablet
```

## 🔧 **수동 테스트 방법**

### **A. 브라우저 개발자 도구**

#### **Chrome DevTools**
1. **F12** 또는 **Ctrl+Shift+I** (Windows/Linux) / **Cmd+Opt+I** (macOS)
2. **Device Toolbar** 클릭 (Ctrl+Shift+M)
3. 다양한 디바이스 선택:
   - iPhone 12 Pro
   - iPad
   - Galaxy S20
   - Pixel 5
   - 커스텀 크기 설정

#### **Firefox Developer Tools**
1. **F12** 또는 **Ctrl+Shift+I**
2. **반응형 디자인 모드** 클릭
3. 디바이스 선택 및 테스트

#### **Safari Web Inspector** (macOS)
1. Safari > 환경설정 > 고급 > "메뉴 막대에서 개발자용 메뉴 보기" 체크
2. 개발자 > 웹 인스펙터 표시
3. 반응형 디자인 모드 사용

### **B. 실제 디바이스 테스트**

#### **Android 디바이스**
```bash
# Chrome 원격 디버깅
1. 설정 > 개발자 옵션 > USB 디버깅 활성화
2. USB로 PC 연결
3. Chrome에서 chrome://inspect 접속
4. 디바이스 선택 후 테스트

# Samsung Internet
1. 삼성 브라우저에서 직접 테스트
2. 네이버 앱 > 웹뷰에서 테스트
```

#### **iOS 디바이스**
```bash
# Safari 웹 인스펙터
1. 설정 > Safari > 고급 > 웹 인스펙터 활성화
2. Mac Safari에서 개발자 메뉴 사용
3. 디바이스 연결 후 테스트

# Chrome for iOS
1. Chrome 앱에서 직접 테스트
2. 네이버 앱 내 브라우저에서 테스트
```

## 📊 **테스트 항목 체크리스트**

### **A. 기본 기능 테스트**
- [ ] **페이지 로딩**: 3초 이내 완료
- [ ] **네비게이션**: 메뉴 클릭 정상 동작
- [ ] **링크**: 모든 링크 정상 작동
- [ ] **폼 입력**: 텍스트 입력, 선택 정상
- [ ] **파일 업로드**: 파일 선택 및 업로드
- [ ] **파일 다운로드**: 다운로드 버튼 동작
- [ ] **이미지 표시**: 모든 이미지 정상 로딩
- [ ] **동영상**: 비디오 재생 정상

### **B. 반응형 레이아웃 테스트**
- [ ] **데스크톱** (1920x1080): 레이아웃 정상
- [ ] **태블릿** (768x1024): 레이아웃 적응
- [ ] **모바일** (375x667): 레이아웃 최적화
- [ ] **가로 모드**: 레이아웃 유지
- [ ] **세로 모드**: 레이아웃 유지
- [ ] **줌 50%**: 텍스트 가독성 유지
- [ ] **줌 200%**: 레이아웃 깨지지 않음

### **C. 성능 테스트**
- [ ] **First Contentful Paint**: < 2초
- [ ] **Largest Contentful Paint**: < 4초
- [ ] **Cumulative Layout Shift**: < 0.1
- [ ] **Total Blocking Time**: < 300ms
- [ ] **메모리 사용량**: < 100MB
- [ ] **네트워크 사용량**: 최적화됨

### **D. 접근성 테스트**
- [ ] **키보드 네비게이션**: Tab으로 모든 요소 접근 가능
- [ ] **스크린 리더**: 주요 내용 읽기 가능
- [ ] **색상 대비**: 4.5:1 이상
- [ ] **ARIA 라벨**: 적절한 라벨 제공
- [ ] **포커스 표시**: 명확한 포커스 표시
- [ ] **텍스트 크기**: 확대 시 가독성 유지

### **E. 네트워크 환경 테스트**
- [ ] **WiFi**: 빠른 연결에서 정상 작동
- [ ] **4G**: 모바일 데이터에서 정상 작동
- [ ] **3G**: 느린 연결에서도 사용 가능
- [ ] **오프라인**: 네트워크 끊김 시 적절한 메시지
- [ ] **복구**: 네트워크 복구 시 자동 재연결

## 🛠️ **고급 테스트 방법**

### **A. 성능 분석**
```bash
# Lighthouse CI 실행
npm run lighthouse

# WebPageTest API 사용
curl "https://www.webpagetest.org/runtest.php?url=https://your-site.com&f=json"
```

### **B. 접근성 검사**
```bash
# axe-core CLI 실행
npx @axe-core/cli http://localhost:8080

# WAVE 웹 접근성 검사
# https://wave.webaim.org/ 에서 URL 입력
```

### **C. 네트워크 시뮬레이션**
```bash
# Chrome DevTools
1. Network 탭 열기
2. Throttling 드롭다운 선택
3. Slow 3G, Fast 3G, Offline 등 선택
4. 페이지 새로고침하여 테스트
```

## 🚨 **문제 해결**

### **A. 일반적인 문제들**

#### **CORS 에러**
```javascript
// 문제: Access to fetch at 'https://api.example.com' from origin 'https://your-site.com' has been blocked by CORS policy

// 해결: 프록시 서버 사용
const response = await fetch('/.netlify/functions/proxy', {
  method: 'POST',
  body: JSON.stringify({
    api: 'external',
    endpoint: '/api/data',
    method: 'GET'
  })
});
```

#### **레이아웃 깨짐**
```css
/* 문제: 모바일에서 레이아웃 깨짐 */
.container {
  width: 1200px; /* 고정 너비 */
}

/* 해결: 반응형 디자인 */
.container {
  max-width: 1200px;
  width: 100%;
  padding: 0 20px;
}

@media (max-width: 768px) {
  .container {
    padding: 0 10px;
  }
}
```

#### **JavaScript 에러**
```javascript
// 문제: ES6+ 문법이 구형 브라우저에서 에러
const arrowFunction = () => { /* ... */ };

// 해결: 폴리필 추가 또는 전통적 문법 사용
function traditionalFunction() { /* ... */ }
```

### **B. 디버깅 도구**

#### **브라우저 콘솔**
```javascript
// 환경 정보 확인
console.log({
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  screenSize: `${screen.width}x${screen.height}`,
  viewportSize: `${window.innerWidth}x${window.innerHeight}`,
  devicePixelRatio: window.devicePixelRatio,
  touchSupport: 'ontouchstart' in window
});

// 에러 캐치
window.addEventListener('error', (e) => {
  console.error('JavaScript Error:', e.error);
  console.error('Stack:', e.error.stack);
});
```

#### **네트워크 모니터링**
```javascript
// 네트워크 요청 모니터링
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch request:', args[0]);
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('Fetch response:', response.status, args[0]);
      return response;
    })
    .catch(error => {
      console.error('Fetch error:', error, args[0]);
      throw error;
    });
};
```

## 📈 **테스트 결과 분석**

### **A. 성공 기준**
- ✅ 모든 주요 브라우저에서 정상 작동
- ✅ 모바일/태블릿에서 반응형 레이아웃 유지
- ✅ 성능 점수 80점 이상 (Lighthouse)
- ✅ 접근성 점수 90점 이상 (axe-core)
- ✅ CORS 에러 없음
- ✅ JavaScript 에러 없음

### **B. 개선 우선순위**
1. **Critical**: 기능이 작동하지 않는 경우
2. **High**: 주요 브라우저에서 문제가 있는 경우
3. **Medium**: 성능이나 접근성 문제
4. **Low**: 미세한 UI/UX 개선

## 🎯 **테스트 실행 권장사항**

### **A. 개발 단계**
- 코드 변경 시마다 로컬 테스트
- 주요 기능 개발 완료 시 전체 테스트
- Pull Request 생성 전 자동 테스트 실행

### **B. 배포 전 단계**
- 모든 환경에서 수동 테스트
- 실제 디바이스에서 테스트
- 성능 및 접근성 검사 완료

### **C. 배포 후 단계**
- 프로덕션 환경에서 최종 확인
- 사용자 피드백 수집 및 분석
- 에러 모니터링 시스템 구축

이 가이드를 따라하면 웹앱이 다양한 환경에서 안정적으로 작동할 수 있습니다! 🚀

