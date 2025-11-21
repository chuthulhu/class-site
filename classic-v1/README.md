# 과학 실험 관리 시스템

> 과학 탐구 실험 과제 제출 및 관리 플랫폼

## 📋 프로젝트 개요

과학 탐구 실험 과제를 위한 웹 기반 관리 시스템입니다. 학생들이 실험 결과를 체계적으로 정리하고 제출할 수 있으며, 교사는 효율적으로 과제를 관리할 수 있습니다.

### 🎯 주요 기능

- **과제 제출**: 실험 결과를 ZIP 파일로 압축하여 OneDrive에 업로드
- **문서 생성**: 자동으로 정리된 보고서 생성 (PDF, HTML)
- **교사키 시스템**: 시간 제한 우회를 통한 조기 접근
- **PWA 지원**: 모바일 친화적인 웹 앱 경험
- **실시간 업로드**: 진행률 표시와 함께 안정적인 파일 업로드

## 🚀 빠른 시작

### 🌐 배포 환경

#### Production 환경 (운영)
- **URL**: `https://physichu.netlify.app/science-experiments/suhaeng3/`
- **교사키**: `https://physichu.netlify.app/science-experiments/suhaeng3/?key=TEACHER_KEY`
- **상태**: ✅ 안정 운영 중

#### Testing 환경 (개발/테스트)
- **URL**: `https://test-physichu.netlify.app/science-experiments/suhaeng3-test/`
- **교사키**: `https://test-physichu.netlify.app/science-experiments/suhaeng3-test/?key=TEACHER_KEY`
- **상태**: ✅ 개발 중

### 📊 환경별 특징

| 환경 | 용도 | 특징 | 함수 |
|------|------|------|------|
| **Production** | 운영 환경 | 안정성 우선, 검증된 기능 | `submit.js`, `download.js` |
| **Testing** | 개발 환경 | 실험적 기능, 디버깅 | `submit_test.js`, `download_test.js` |

## 🔧 기술 스택

- **Frontend**: HTML, CSS (Tailwind), JavaScript (ES6+)
- **Backend**: Netlify Functions (Node.js)
- **Storage**: Microsoft OneDrive (Graph API)
- **Deployment**: Netlify
- **Build Tools**: esbuild, JSZip
- **PWA**: Service Worker, Web App Manifest

## 📁 프로젝트 구조

### 🏗️ 멀티 환경 배포 구조

이 프로젝트는 **하나의 GitHub 저장소**에서 **두 개의 독립적인 Netlify 사이트**를 배포하는 구조입니다.

```
class-site/
├── class-site/                    # 🏠 Production 환경 (운영)
│   ├── science-experiments/      # 과학 실험 모듈
│   │   ├── suhaeng1/             # 수행1
│   │   ├── suhaeng2/             # 수행2
│   │   └── suhaeng3/             # 수행3 (메인 운영)
│   └── netlify/functions/         # 운영용 서버리스 함수
│       ├── submit.js             # 운영용 제출 함수
│       ├── download.js           # 운영용 다운로드 함수
│       └── gate-session2.js      # 세션2 게이트
├── testing/                       # 🧪 Testing 환경 (개발)
│   ├── src/science-experiments/
│   │   └── suhaeng3-test/        # 테스트용 수행3
│   ├── functions/                # 테스트용 서버리스 함수
│   │   ├── submit_test.js        # 테스트용 제출 함수
│   │   ├── download_test.js      # 테스트용 다운로드 함수
│   │   └── gate-session2.js      # 세션2 게이트
│   └── netlify.toml              # 테스트 환경 설정
├── production/                   # 🚀 향후 프로덕션 환경
├── docs/                         # 📚 사용자 문서
├── project/                      # 📋 개발자 문서
├── scripts/                      # 🔧 자동화 스크립트
└── archives/                     # 📦 백업 및 아카이브
```

## 🎮 사용 방법

### 학생용
1. 웹사이트 접속
2. 실험 결과 입력
3. 파일 업로드 및 제출
4. ZIP 파일 다운로드

### 교사용
1. 교사키로 조기 접근
2. 학생 제출물 확인
3. OneDrive에서 관리

## 🔄 최근 업데이트

### v1.3.0 (2025-10-15)
- ✅ **Playwright 테스트 프레임워크**: 환경별 자동화 테스트 시스템 구축
- ✅ **물리학II 웹앱**: 물리학연관기사탐구 수행평가 웹앱 추가
- ✅ **문서 통합**: 중복 문서 정리 및 완전 가이드 생성
- ✅ **환경별 호환성**: 모든 주요 브라우저/디바이스에서 검증 완료
- ✅ **교사키 시스템**: 시간 함수와 독립적으로 작동하도록 개선

### v1.2.0 (2025-08-30)
- ✅ 업로드 우선 흐름으로 변경
- ✅ 인앱 브라우저 대응
- ✅ iOS Safari 전용 UX 개선
- ✅ KST 기준 타임스탬프 생성

## 📚 문서

### 📖 통합 가이드 (권장)
- [과학탐구실험 완전 가이드](docs/suhaeng3-complete-guide.md) - 사용자용 종합 가이드
- [테스트 완전 가이드](docs/testing-complete-guide.md) - 환경별 테스트 방법
- [교사키 완전 가이드](docs/teacher-key-complete-guide.md) - 교사키 시스템 상세

### 🔧 개발자 문서
- [프로젝트 상세](project/README.md)
- [API 문서](project/api.md)
- [배포 가이드](project/deployment.md)
- [변경 이력](CHANGELOG.md)
- [향후 계획](ROADMAP.md)

### 🧪 테스트 관련
- [Playwright 문제 해결](docs/PLAYWRIGHT_TROUBLESHOOTING.md)
- [물리학II 테스트 결과](docs/PHYSICS2_TEST_RESULTS.md)
- [테스트 프레임워크](testing-framework/README.md)

## 🛠️ 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- Netlify CLI
- Microsoft Graph API 앱 등록

### 로컬 개발
```bash
# 의존성 설치
npm install

# 로컬 서버 실행
netlify dev
```

### 환경 변수 설정
```bash
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
MICROSOFT_TENANT_ID=your_tenant_id
```

## 🧪 테스트

### 자동화 테스트 (권장)
```bash
# Playwright 테스트 프레임워크 사용
cd testing-framework
npm install
npx playwright install --with-deps
npm run test:all

# 결과 확인
npm run test:report
```

### 수동 테스트
- [테스트 완전 가이드](docs/testing-complete-guide.md) 참조
- 브라우저 개발자 도구 활용 (Chrome DevTools Device Toolbar)

## 🚀 배포

### 자동 배포
```bash
# 프로덕션 배포
./scripts/deploy.sh production

# 테스트 환경 배포
./scripts/deploy.sh testing
```

### 수동 배포
- [배포 가이드](project/deployment.md) 참조

## 🔒 보안

- 환경 변수로 민감한 정보 관리
- 교사키 시스템으로 접근 제어
- 파일 업로드 검증 및 제한
- HTTPS 강제 사용

## 🤝 기여

1. 이슈 등록
2. 브랜치 생성
3. 변경사항 커밋
4. Pull Request 생성

## 📞 지원

- **문서**: [docs/](docs/) 폴더 참조
- **이슈**: [project/ISSUES.md](project/ISSUES.md)
- **변경사항**: [CHANGELOG.md](CHANGELOG.md)

## 📄 라이선스

이 프로젝트는 교육 목적으로 개발되었습니다.

---

**마지막 업데이트**: 2025-10-15  
**버전**: 1.3.0  
**상태**: 운영 중
