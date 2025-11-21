const fs = require('fs');
const path = require('path');

/**
 * 통합 테스트 리포트 생성 스크립트
 * 모든 테스트 결과를 종합하여 하나의 리포트 생성
 */

class TestReportGenerator {
  constructor() {
    this.reportsDir = path.join(__dirname, '../reports');
    this.outputDir = path.join(this.reportsDir, 'comprehensive');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  async generateReport() {
    console.log('통합 테스트 리포트 생성 시작...');
    
    // 출력 디렉토리 생성
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // 각 테스트 결과 수집
    const compatibilityResults = await this.collectCompatibilityResults();
    const performanceResults = await this.collectPerformanceResults();
    const accessibilityResults = await this.collectAccessibilityResults();

    // 통합 리포트 생성
    const comprehensiveReport = {
      timestamp: this.timestamp,
      summary: this.generateSummary(compatibilityResults, performanceResults, accessibilityResults),
      compatibility: compatibilityResults,
      performance: performanceResults,
      accessibility: accessibilityResults,
      recommendations: this.generateRecommendations(compatibilityResults, performanceResults, accessibilityResults)
    };

    // JSON 리포트 저장
    const jsonReportPath = path.join(this.outputDir, `comprehensive-report-${this.timestamp}.json`);
    fs.writeFileSync(jsonReportPath, JSON.stringify(comprehensiveReport, null, 2));

    // HTML 리포트 생성
    const htmlReport = this.generateHTMLReport(comprehensiveReport);
    const htmlReportPath = path.join(this.outputDir, `comprehensive-report-${this.timestamp}.html`);
    fs.writeFileSync(htmlReportPath, htmlReport);

    // 마크다운 리포트 생성
    const markdownReport = this.generateMarkdownReport(comprehensiveReport);
    const markdownReportPath = path.join(this.outputDir, `comprehensive-report-${this.timestamp}.md`);
    fs.writeFileSync(markdownReportPath, markdownReport);

    console.log(`통합 리포트 생성 완료: ${this.outputDir}`);
    console.log(`- JSON: ${jsonReportPath}`);
    console.log(`- HTML: ${htmlReportPath}`);
    console.log(`- Markdown: ${markdownReportPath}`);
  }

  async collectCompatibilityResults() {
    const results = [];
    
    // Playwright 테스트 결과 수집
    const playwrightResultsPath = path.join(this.reportsDir, 'test-results.json');
    if (fs.existsSync(playwrightResultsPath)) {
      try {
        const playwrightData = JSON.parse(fs.readFileSync(playwrightResultsPath, 'utf8'));
        results.push({
          type: 'playwright',
          data: playwrightData,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.log('Playwright 결과 파싱 실패:', error.message);
      }
    }

    return results;
  }

  async collectPerformanceResults() {
    const results = [];
    
    // Lighthouse 결과 수집
    const lighthouseDir = path.join(this.reportsDir, 'lighthouse');
    if (fs.existsSync(lighthouseDir)) {
      const files = fs.readdirSync(lighthouseDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(lighthouseDir, file), 'utf8'));
            results.push({
              type: 'lighthouse',
              url: file.replace('.json', ''),
              data: data,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            console.log(`Lighthouse 결과 파싱 실패 (${file}):`, error.message);
          }
        }
      }
    }

    return results;
  }

  async collectAccessibilityResults() {
    const results = [];
    
    // axe-core 결과 수집
    const accessibilityPath = path.join(this.reportsDir, 'accessibility.json');
    if (fs.existsSync(accessibilityPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(accessibilityPath, 'utf8'));
        results.push({
          type: 'axe-core',
          data: data,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.log('접근성 결과 파싱 실패:', error.message);
      }
    }

    return results;
  }

  generateSummary(compatibility, performance, accessibility) {
    const totalTests = compatibility.length + performance.length + accessibility.length;
    const passedTests = compatibility.filter(r => r.data?.status === 'passed').length +
                       performance.filter(r => r.data?.score >= 0.7).length +
                       accessibility.filter(r => r.data?.violations?.length === 0).length;

    return {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      passRate: totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0,
      environments: this.getTestedEnvironments(compatibility),
      criticalIssues: this.getCriticalIssues(compatibility, performance, accessibility)
    };
  }

  getTestedEnvironments(compatibility) {
    const environments = new Set();
    
    compatibility.forEach(result => {
      if (result.data?.suites) {
        result.data.suites.forEach(suite => {
          if (suite.specs) {
            suite.specs.forEach(spec => {
              if (spec.tests) {
                spec.tests.forEach(test => {
                  if (test.results) {
                    test.results.forEach(testResult => {
                      if (testResult.projectName) {
                        environments.add(testResult.projectName);
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });

    return Array.from(environments);
  }

  getCriticalIssues(compatibility, performance, accessibility) {
    const issues = [];

    // 성능 이슈
    performance.forEach(result => {
      if (result.data?.score < 0.7) {
        issues.push({
          type: 'performance',
          severity: 'high',
          message: `${result.url}: 성능 점수 ${(result.data.score * 100).toFixed(1)}% (기준: 70%)`,
          url: result.url
        });
      }
    });

    // 접근성 이슈
    accessibility.forEach(result => {
      if (result.data?.violations && result.data.violations.length > 0) {
        issues.push({
          type: 'accessibility',
          severity: 'high',
          message: `${result.data.violations.length}개의 접근성 위반 발견`,
          violations: result.data.violations
        });
      }
    });

    return issues;
  }

  generateRecommendations(compatibility, performance, accessibility) {
    const recommendations = [];

    // 성능 개선 권장사항
    performance.forEach(result => {
      if (result.data?.score < 0.8) {
        recommendations.push({
          category: 'performance',
          priority: 'high',
          title: '성능 최적화 필요',
          description: `${result.url}의 성능 점수를 개선하세요.`,
          suggestions: [
            '이미지 최적화',
            'CSS/JS 번들 크기 줄이기',
            '캐싱 전략 개선',
            'CDN 사용 고려'
          ]
        });
      }
    });

    // 접근성 개선 권장사항
    accessibility.forEach(result => {
      if (result.data?.violations && result.data.violations.length > 0) {
        recommendations.push({
          category: 'accessibility',
          priority: 'medium',
          title: '접근성 개선 필요',
          description: '웹 접근성 가이드라인을 준수하도록 개선하세요.',
          suggestions: [
            '키보드 네비게이션 지원',
            '스크린 리더 호환성',
            '색상 대비 개선',
            'ARIA 라벨 추가'
          ]
        });
      }
    });

    return recommendations;
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>통합 테스트 리포트 - ${report.timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .success { border-left: 4px solid #28a745; }
        .warning { border-left: 4px solid #ffc107; }
        .error { border-left: 4px solid #dc3545; }
        .recommendations { margin-top: 30px; }
        .recommendation { background: #e9ecef; padding: 15px; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>웹앱 호환성 테스트 리포트</h1>
        <p>생성 시간: ${report.timestamp}</p>
    </div>

    <div class="summary">
        <div class="card ${report.summary.passRate >= 80 ? 'success' : 'warning'}">
            <h3>전체 테스트</h3>
            <p>총 ${report.summary.totalTests}개 테스트</p>
            <p>통과율: ${report.summary.passRate}%</p>
        </div>
        
        <div class="card">
            <h3>테스트 환경</h3>
            <ul>
                ${report.summary.environments.map(env => `<li>${env}</li>`).join('')}
            </ul>
        </div>
        
        <div class="card ${report.summary.criticalIssues.length === 0 ? 'success' : 'error'}">
            <h3>중요 이슈</h3>
            <p>${report.summary.criticalIssues.length}개 발견</p>
        </div>
    </div>

    <div class="recommendations">
        <h2>개선 권장사항</h2>
        ${report.recommendations.map(rec => `
            <div class="recommendation">
                <h4>${rec.title}</h4>
                <p>${rec.description}</p>
                <ul>
                    ${rec.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                </ul>
            </div>
        `).join('')}
    </div>
</body>
</html>`;
  }

  generateMarkdownReport(report) {
    return `# 웹앱 호환성 테스트 리포트

**생성 시간:** ${report.timestamp}

## 📊 테스트 요약

- **총 테스트 수:** ${report.summary.totalTests}개
- **통과율:** ${report.summary.passRate}%
- **중요 이슈:** ${report.summary.criticalIssues.length}개

## 🌐 테스트 환경

${report.summary.environments.map(env => `- ${env}`).join('\n')}

## ⚠️ 중요 이슈

${report.summary.criticalIssues.length === 0 ? 
  '✅ 중요 이슈가 발견되지 않았습니다.' : 
  report.summary.criticalIssues.map(issue => 
    `- **${issue.type}**: ${issue.message}`
  ).join('\n')
}

## 💡 개선 권장사항

${report.recommendations.map(rec => 
  `### ${rec.title}\n\n${rec.description}\n\n${rec.suggestions.map(s => `- ${s}`).join('\n')}`
).join('\n\n')}

---
*이 리포트는 자동으로 생성되었습니다.*`;
  }
}

// 스크립트 실행
if (require.main === module) {
  const generator = new TestReportGenerator();
  generator.generateReport().catch(console.error);
}

module.exports = TestReportGenerator;

