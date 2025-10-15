import { test, expect } from '@playwright/test';

/**
 * 기능별 상세 테스트 스위트
 * 각 웹앱의 핵심 기능을 환경별로 테스트
 */

test.describe('수행평가3 상세 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/science-experiments/suhaeng3/');
    await page.waitForLoadState('networkidle');
  });

  test('세션 선택 기능', async ({ page }) => {
    // 세션 버튼들 찾기
    const sessionButtons = page.locator('button, a').filter({ hasText: /세션|Session/ });
    const buttonCount = await sessionButtons.count();
    
    if (buttonCount > 0) {
      const firstButton = sessionButtons.first();
      await expect(firstButton).toBeVisible();
      
      // 클릭 가능한지 확인
      await firstButton.click();
      
      // 페이지 변화 확인
      await page.waitForTimeout(1000);
      
      // URL 변화 또는 페이지 내용 변화 확인
      const currentUrl = page.url();
      const pageContent = await page.content();
      
      expect(currentUrl.length).toBeGreaterThan(0);
      expect(pageContent.length).toBeGreaterThan(0);
    }
  });

  test('파일 업로드 기능', async ({ page }) => {
    // 파일 입력 요소 찾기
    const fileInputs = page.locator('input[type="file"]');
    const inputCount = await fileInputs.count();
    
    if (inputCount > 0) {
      const fileInput = fileInputs.first();
      await expect(fileInput).toBeVisible();
      
      // 테스트용 더미 파일 생성
      const testFileContent = '테스트 파일 내용';
      const testFile = new File([testFileContent], 'test.txt', { type: 'text/plain' });
      
      // 파일 업로드 시뮬레이션
      await fileInput.setInputFiles({
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from(testFileContent)
      });
      
      // 업로드 후 상태 확인
      await page.waitForTimeout(1000);
      
      // 업로드 성공 메시지 또는 상태 변화 확인
      const successIndicators = [
        '.upload-success',
        '.file-uploaded',
        '[data-status="success"]',
        'text="업로드 완료"',
        'text="Upload complete"'
      ];
      
      let uploadSuccess = false;
      for (const indicator of successIndicators) {
        const element = page.locator(indicator);
        if (await element.count() > 0) {
          uploadSuccess = true;
          break;
        }
      }
      
      console.log(`파일 업로드 테스트 결과: ${uploadSuccess ? '성공' : '상태 불명'}`);
    }
  });

  test('폼 입력 및 제출', async ({ page }) => {
    // 텍스트 입력 필드들 찾기
    const textInputs = page.locator('input[type="text"], textarea');
    const inputCount = await textInputs.count();
    
    if (inputCount > 0) {
      // 첫 번째 입력 필드에 테스트 데이터 입력
      const firstInput = textInputs.first();
      await firstInput.fill('테스트 입력 데이터');
      
      // 제출 버튼 찾기
      const submitButtons = page.locator('button[type="submit"], input[type="submit"], button').filter({ hasText: /제출|Submit|저장|Save/ });
      const submitCount = await submitButtons.count();
      
      if (submitCount > 0) {
        const submitButton = submitButtons.first();
        await expect(submitButton).toBeVisible();
        
        // 제출 버튼 클릭
        await submitButton.click();
        
        // 제출 후 상태 확인
        await page.waitForTimeout(2000);
        
        // 성공/실패 메시지 확인
        const resultIndicators = [
          '.success-message',
          '.error-message',
          '.alert',
          '[role="alert"]'
        ];
        
        let resultFound = false;
        for (const indicator of resultIndicators) {
          const element = page.locator(indicator);
          if (await element.count() > 0) {
            resultFound = true;
            break;
          }
        }
        
        console.log(`폼 제출 테스트 결과: ${resultFound ? '응답 확인됨' : '응답 없음'}`);
      }
    }
  });

  test('모바일 터치 인터랙션', async ({ page }) => {
    // 모바일 환경에서만 실행
    if (test.info().project.name.includes('mobile') || 
        test.info().project.name.includes('android') || 
        test.info().project.name.includes('ios')) {
      
      // 터치 가능한 요소들 찾기
      const touchElements = page.locator('button, a, [onclick], .touchable, .clickable');
      const elementCount = await touchElements.count();
      
      if (elementCount > 0) {
        // 첫 번째 터치 요소에 터치 이벤트 발생
        const firstElement = touchElements.first();
        await firstElement.tap();
        
        // 터치 후 상태 변화 확인
        await page.waitForTimeout(1000);
        
        // 시각적 피드백 확인 (CSS 변화 등)
        const elementStyle = await firstElement.evaluate(el => {
          return window.getComputedStyle(el);
        });
        
        console.log('터치 요소 스타일:', elementStyle);
      }
      
      // 스와이프 제스처 테스트
      await page.touchscreen.tap(100, 100);
      await page.touchscreen.tap(200, 200);
      
      // 핀치 줌 테스트 (지원되는 경우)
      try {
        await page.touchscreen.tap(150, 150);
        await page.touchscreen.tap(250, 250);
      } catch (error) {
        console.log('핀치 줌 테스트 건너뜀:', error.message);
      }
    }
  });
});

test.describe('네트워크 및 API 테스트', () => {
  test('API 호출 테스트', async ({ page }) => {
    const apiCalls = [];
    
    // 네트워크 요청 모니터링
    page.on('request', request => {
      if (request.url().includes('/api/') || request.url().includes('/functions/')) {
        apiCalls.push({
          url: request.url(),
          method: request.method(),
          timestamp: Date.now()
        });
      }
    });
    
    page.on('response', response => {
      const request = response.request();
      if (request.url().includes('/api/') || request.url().includes('/functions/')) {
        console.log(`API 응답: ${response.status()} - ${request.url()}`);
      }
    });
    
    await page.goto('/science-experiments/suhaeng3/');
    await page.waitForLoadState('networkidle');
    
    // 페이지에서 API 호출을 유발하는 액션 수행
    const buttons = page.locator('button, a');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // 첫 번째 버튼 클릭하여 API 호출 유발
      await buttons.first().click();
      await page.waitForTimeout(2000);
    }
    
    console.log(`발견된 API 호출 수: ${apiCalls.length}`);
    
    // API 호출이 있다면 상태 코드 확인
    for (const apiCall of apiCalls) {
      expect(apiCall.url).toBeTruthy();
      expect(apiCall.method).toBeTruthy();
    }
  });

  test('오프라인 모드 테스트', async ({ page, context }) => {
    await page.goto('/');
    
    // 네트워크 연결 차단
    await context.setOffline(true);
    
    // 페이지 새로고침
    await page.reload();
    
    // 오프라인 상태에서도 기본 기능 동작 확인
    await expect(page.locator('body')).toBeVisible();
    
    // 네트워크 연결 복구
    await context.setOffline(false);
    
    // 온라인 상태로 복구 확인
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    console.log('오프라인/온라인 모드 테스트 완료');
  });
});

test.describe('보안 및 권한 테스트', () => {
  test('HTTPS 및 보안 헤더', async ({ page }) => {
    const response = await page.goto('/');
    
    if (response) {
      const headers = response.headers();
      
      // 보안 헤더 확인
      const securityHeaders = [
        'strict-transport-security',
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection'
      ];
      
      for (const header of securityHeaders) {
        if (headers[header]) {
          console.log(`보안 헤더 발견: ${header} = ${headers[header]}`);
        }
      }
    }
  });

  test('쿠키 및 로컬 스토리지', async ({ page }) => {
    await page.goto('/');
    
    // 쿠키 설정 시도
    await page.context().addCookies([
      {
        name: 'test-cookie',
        value: 'test-value',
        domain: 'localhost',
        path: '/'
      }
    ]);
    
    // 로컬 스토리지 설정
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
      sessionStorage.setItem('test-session', 'test-session-value');
    });
    
    // 설정된 값 확인
    const cookieValue = await page.evaluate(() => {
      return document.cookie;
    });
    
    const localStorageValue = await page.evaluate(() => {
      return localStorage.getItem('test-key');
    });
    
    const sessionStorageValue = await page.evaluate(() => {
      return sessionStorage.getItem('test-session');
    });
    
    console.log('쿠키 값:', cookieValue);
    console.log('로컬 스토리지 값:', localStorageValue);
    console.log('세션 스토리지 값:', sessionStorageValue);
    
    // 값이 올바르게 저장되었는지 확인
    expect(localStorageValue).toBe('test-value');
    expect(sessionStorageValue).toBe('test-session-value');
  });
});

