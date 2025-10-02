# 과학 실험 관리 시스템

## 🎯 프로젝트 개요

과학 실험 수행을 위한 통합 관리 시스템으로, 파일 업로드, ZIP 생성, OneDrive 연동 등의 기능을 제공합니다.

## 📁 프로젝트 구조

### 현재 구조 (기존 배포 환경)
```
class-site/
├── science-experiments/
│   ├── suhaeng1/           # 수행1
│   ├── suhaeng2/           # 수행2
│   ├── suhaeng3/           # 수행3 (메인)
│   └── suhaeng3-test/      # 수행3 테스트
├── netlify/
│   └── functions/          # 서버리스 함수들
└── netlify.toml            # 배포 설정
```

### 새로운 구조 (개선된 환경)
```
class-site/
├── 📦 production/          # 새로운 운영 환경
├── 🧪 testing/            # 새로운 테스트 환경
├── 📚 archives/           # 백업 및 아카이브
├── 📖 docs/              # 통합 문서
├── 🔧 scripts/           # 자동화 스크립트
├── ⚙️ config/            # 설정 파일들
└── 📋 project/           # 프로젝트 관리
```

## 🚀 주요 기능

### Phase 1 개선사항
- ✅ 환경변수 검증 강화
- ✅ 구조화된 로깅 시스템
- ✅ 파일 검증 강화
- ✅ 동적 청크 크기 계산

### Phase 2 개선사항
- ✅ 모듈 시스템 도입
- ✅ PWA 지원
- ✅ 사용자 경험 개선
- ✅ 성능 최적화

## 🔧 기술 스택

- **Frontend**: HTML, CSS (Tailwind), JavaScript
- **Backend**: Netlify Functions
- **Storage**: Microsoft OneDrive
- **Deployment**: Netlify

## 📋 사용 방법

### 기존 환경 (현재 배포)
- URL: 기존 웹 주소 그대로 유지
- 기능: 안정화된 운영 기능

### 새로운 환경 (개선된 기능)
- Production: 안정화된 운영 환경
- Testing: 개발 및 테스트 환경

## 🔄 개발 워크플로우

1. **개발**: Testing 환경에서 기능 개발
2. **테스트**: Testing 환경에서 검증
3. **배포**: Production 환경으로 승격
4. **모니터링**: 운영 상태 확인

## 📚 문서

- [배포 가이드](docs/deployment/README.md)
- [테스트 가이드](docs/testing/README.md)
- [프로젝트 로드맵](ROADMAP.md)
- [이슈 트래킹](ISSUES.md)

## 🛡️ 안전성

- 기존 배포 환경은 전혀 영향받지 않음
- 새로운 환경은 완전히 독립적
- 체계적인 백업 시스템
- 쉬운 롤백 기능

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 등록해 주세요.
