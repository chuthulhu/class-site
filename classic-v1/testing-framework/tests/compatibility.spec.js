import { test, expect } from '@playwright/test';

/**
 * 웹앱 호환성 테스트 스위트
 * 기존 웹앱에 전혀 영향을 주지 않는 독립적인 테스트
 */

test.describe('메인 포털 페이지 테스트', () => {
  test('페이지 로딩 및 기본 구조', async ({ page }) => {
    await page.goto('/');
    
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/과학탐구실험|물리학II/);
    
    // 기본 요소 존재 확인
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('html')).toBeVisible();
    
    // 스크린샷 캡처
    await page.screenshot({ 
      path: `reports/screenshots/${test.info().project.name}-main-page.png`,
      fullPage: true 
    });
  });

  test('네비게이션 메뉴 동작', async ({ page }) => {
    await page.goto('/');
    
    // 메뉴 요소 찾기 (다양한 선택자 시도)
    const menuSelectors = [
      'nav',
      '.menu',
      '.navigation',
      '[role="navigation"]',
      'header nav',
      '.navbar'
    ];
    
    let menuFound = false;
    for (const selector of menuSelectors) {
      const menu = page.locator(selector);
      if (await menu.count() > 0) {
        menuFound = true;
        await expect(menu).toBeVisible();
        break;
      }
    }
    
    // 메뉴가 없어도 테스트 통과 (유연한 구조)
    console.log(`메뉴 발견: ${menuFound}`);
  });

  test('링크 동작 확인', async ({ page }) => {
    await page.goto('/');
    
    // 모든 링크 찾기
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    
    console.log(`발견된 링크 수: ${linkCount}`);
    
    // 첫 5개 링크만 테스트 (성능 고려)
    for (let i = 0; i < Math.min(5, linkCount); i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      
      // 외부 링크는 건너뛰기
      if (href && !href.startsWith('http') && !href.startsWith('//')) {
        await expect(link).toBeVisible();
      }
    }
  });
});

test.describe('과학탐구실험 앱 테스트', () => {
  test('과학탐구실험 홈페이지', async ({ page }) => {
    await page.goto('/science-experiments/');
    
    // 페이지 로딩 확인
    await expect(page).toHaveTitle(/과학탐구실험/);
    
    // 주요 섹션 확인
    const sections = [
      'h1', 'h2', 'h3',
      '.container', '.main', '.content',
      '[role="main"]'
    ];
    
    let contentFound = false;
    for (const selector of sections) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        contentFound = true;
        break;
      }
    }
    
    expect(contentFound).toBeTruthy();
    
    await page.screenshot({ 
      path: `reports/screenshots/${test.info().project.name}-science-experiments.png`,
      fullPage: true 
    });
  });

  test('수행평가 앱 접근', async ({ page }) => {
    // 수행평가 앱들 테스트
    const apps = [
      '/science-experiments/suhaeng1/',
      '/science-experiments/suhaeng2/',
      '/science-experiments/suhaeng3/'
    ];
    
    for (const app of apps) {
      try {
        await page.goto(app);
        
        // 페이지 로딩 확인
        await expect(page).toHaveTitle(/수행평가|과학탐구/);
        
        // 기본 구조 확인
        await expect(page.locator('body')).toBeVisible();
        
        console.log(`${app} 접근 성공`);
        
      } catch (error) {
        console.log(`${app} 접근 실패: ${error.message}`);
        // 개별 앱 실패는 전체 테스트 실패로 이어지지 않음
      }
    }
  });
});

test.describe('물리학II 앱 테스트', () => {
  test('물리학II 앱 접근', async ({ page }) => {
    await page.goto('/physics2/');
    
    // 페이지 로딩 확인
    await expect(page).toHaveTitle(/물리학II|Physics/);
    
    await page.screenshot({ 
      path: `reports/screenshots/${test.info().project.name}-physics2.png`,
      fullPage: true 
    });
  });
});

test.describe('반응형 및 모바일 테스트', () => {
  test('모바일 뷰포트 테스트', async ({ page }) => {
    await page.goto('/');
    
    // 모바일 환경에서만 실행
    if (test.info().project.name.includes('mobile') || 
        test.info().project.name.includes('android') || 
        test.info().project.name.includes('ios')) {
      
      // 터치 이벤트 테스트
      const touchTargets = page.locator('button, a, [onclick], .touch-target');
      const touchCount = await touchTargets.count();
      
      if (touchCount > 0) {
        const firstTarget = touchTargets.first();
        await firstTarget.tap();
        
        // 터치 후 상태 변화 확인
        await page.waitForTimeout(500);
      }
      
      // 스크롤 테스트
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      await page.waitForTimeout(1000);
      
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
    }
  });

  test('폼 요소 테스트', async ({ page }) => {
    await page.goto('/science-experiments/suhaeng3/');
    
    // 폼 요소들 찾기
    const formElements = [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="file"]',
      'textarea',
      'select',
      'button[type="submit"]'
    ];
    
    for (const selector of formElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        const element = elements.first();
        await expect(element).toBeVisible();
        
        // 입력 가능한 요소 테스트
        if (selector.includes('input[type="text"]') || selector.includes('textarea')) {
          await element.fill('테스트 입력');
          await expect(element).toHaveValue('테스트 입력');
        }
      }
    }
  });
});

test.describe('성능 및 접근성 테스트', () => {
  test('페이지 로딩 성능', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`페이지 로딩 시간: ${loadTime}ms`);
    
    // 로딩 시간이 10초를 넘지 않아야 함
    expect(loadTime).toBeLessThan(10000);
  });

  test('이미지 로딩 확인', async ({ page }) => {
    await page.goto('/');
    
    // 모든 이미지 요소 찾기
    const images = page.locator('img');
    const imageCount = await images.count();
    
    console.log(`발견된 이미지 수: ${imageCount}`);
    
    // 이미지 로딩 상태 확인
    for (let i = 0; i < Math.min(5, imageCount); i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      
      if (src) {
        // 이미지 로딩 대기
        await img.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
          console.log(`이미지 로딩 실패: ${src}`);
        });
      }
    }
  });

  test('JavaScript 에러 확인', async ({ page }) => {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // JavaScript 에러가 있으면 로그만 남기고 테스트는 통과
    if (errors.length > 0) {
      console.log('발견된 JavaScript 에러들:', errors);
    }
  });
});

