# Playwright 브라우저 설치 문제 해결 가이드

## 🚨 **현재 문제 상황**
```
Error: self-signed certificate in certificate chain
Failed to download Chromium 141.0.7390.37
```

이는 네트워크 환경의 SSL 인증서 문제로 인한 것입니다.

## 🔧 **해결 방법들**

### **방법 1: 시스템 인증서 업데이트 (권장)**

#### **Windows에서 실행**
```powershell
# 관리자 권한으로 PowerShell 실행 후
certlm.msc
```

1. **인증서 관리자** 열기
2. **신뢰할 수 있는 루트 인증 기관** → **인증서** 확인
3. **Microsoft Root Certificate Authority** 존재 확인
4. 없다면 Windows 업데이트 실행

#### **또는 PowerShell에서**
```powershell
# 관리자 권한으로 실행
Get-ChildItem -Path "Cert:\LocalMachine\Root" | Where-Object {$_.Subject -like "*Microsoft*"}
```

### **방법 2: 프록시 환경 우회**

#### **회사/학교 네트워크인 경우**
```bash
# 환경변수 설정
set HTTP_PROXY=
set HTTPS_PROXY=
set NO_PROXY=localhost,127.0.0.1

# 또는 npm 설정
npm config delete proxy
npm config delete https-proxy
```

#### **개인 네트워크인 경우**
```bash
# DNS 변경 시도
nslookup cdn.playwright.dev
nslookup playwright.download.prss.microsoft.com
```

### **방법 3: 수동 다운로드 및 설치**

#### **1단계: 브라우저 수동 다운로드**
```bash
# Chrome 브라우저가 이미 설치되어 있다면
# Playwright가 시스템 Chrome을 사용하도록 설정
```

#### **2단계: Playwright 설정 수정**
```javascript
// playwright.config.js 수정
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  use: {
    // 시스템에 설치된 Chrome 사용
    channel: 'chrome', // 또는 'msedge'
  },
  projects: [
    {
      name: 'chrome-system',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome' // 시스템 Chrome 사용
      },
    },
  ],
});
```

### **방법 4: 대안 테스트 도구 사용**

#### **Puppeteer 사용**
```bash
npm install puppeteer
```

```javascript
// puppeteer-test.js
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080/class-site/physics2/activity2/');
  
  // 테스트 수행
  await page.screenshot({ path: 'test-result.png' });
  await browser.close();
})();
```

#### **Selenium WebDriver 사용**
```bash
npm install selenium-webdriver
```

### **방법 5: 온라인 테스트 서비스 활용**

#### **BrowserStack (유료)**
- 클라우드에서 다양한 브라우저 테스트
- 무료 체험판 제공

#### **Sauce Labs (유료)**
- 클라우드 기반 브라우저 테스트
- 무료 체험판 제공

#### **CrossBrowserTesting (유료)**
- 다양한 디바이스/브라우저 테스트

## 🎯 **즉시 사용 가능한 대안**

### **브라우저 개발자 도구 활용**
```bash
# 가장 실용적인 방법
# Chrome DevTools → Device Toolbar 사용
```

1. **Chrome 열기** → `F12`
2. **Device Toolbar** (`Ctrl+Shift+M`)
3. **다양한 디바이스 선택**:
   - iPhone 12 Pro
   - Galaxy S20
   - iPad
   - Desktop

### **수동 테스트 스크립트**
```javascript
// manual-test.js
const testCases = [
  { device: 'Desktop', width: 1920, height: 1080 },
  { device: 'iPad', width: 768, height: 1024 },
  { device: 'iPhone', width: 375, height: 667 },
];

testCases.forEach(testCase => {
  console.log(`Testing ${testCase.device}: ${testCase.width}x${testCase.height}`);
  // 수동으로 브라우저 크기 조정하여 테스트
});
```

## 🔄 **임시 해결책**

### **기존 Chrome 브라우저 활용**
```bash
# 시스템에 Chrome이 설치되어 있다면
# Playwright가 시스템 Chrome을 사용하도록 설정
```

```javascript
// playwright.config.js
export default defineConfig({
  projects: [
    {
      name: 'chrome-system',
      use: { 
        channel: 'chrome' // 시스템 Chrome 사용
      },
    },
  ],
});
```

### **Edge 브라우저 사용**
```bash
# Edge가 설치되어 있다면
npx playwright install msedge
```

## 📋 **체크리스트**

### **문제 진단**
- [ ] 네트워크 환경 확인 (회사/학교/개인)
- [ ] 방화벽 설정 확인
- [ ] 프록시 설정 확인
- [ ] 시스템 인증서 확인

### **해결 시도**
- [ ] 시스템 인증서 업데이트
- [ ] 프록시 설정 제거
- [ ] DNS 변경
- [ ] 시스템 브라우저 사용
- [ ] 대안 도구 사용

### **대안 방법**
- [ ] 브라우저 개발자 도구 활용
- [ ] 수동 테스트 수행
- [ ] 온라인 테스트 서비스 사용

## 💡 **권장사항**

### **즉시 사용 가능**
1. **Chrome DevTools Device Toolbar** 사용
2. **수동 테스트** 수행
3. **시스템 Chrome** 활용

### **장기적 해결**
1. **네트워크 관리자**와 상담 (회사/학교 환경)
2. **시스템 인증서** 업데이트
3. **대안 테스트 도구** 도입

## 🎯 **결론**

Playwright 설치 문제는 네트워크 환경의 인증서 문제입니다. 

**즉시 사용 가능한 해결책:**
- ✅ **Chrome DevTools** 활용 (가장 실용적)
- ✅ **수동 테스트** 수행
- ✅ **시스템 브라우저** 활용

**장기적 해결책:**
- 🔧 **네트워크 환경** 개선
- 🔧 **시스템 인증서** 업데이트
- 🔧 **대안 도구** 도입

**현재로서는 브라우저 개발자 도구를 활용한 수동 테스트가 가장 효과적입니다!** 🚀

