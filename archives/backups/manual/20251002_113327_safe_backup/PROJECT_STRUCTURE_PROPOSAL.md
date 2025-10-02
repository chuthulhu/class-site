# 프로젝트 구조 개선 제안

## 🎯 목표
- **배포**: 안정적인 운영 환경
- **테스트**: 독립적인 기능 테스트 환경  
- **백업**: 체계적인 버전 관리 및 롤백 시스템

## 📁 제안하는 새로운 구조

```
class-site/
├── 📦 production/           # 배포 환경 (안정화된 버전)
│   ├── src/
│   │   ├── science-experiments/
│   │   │   ├── suhaeng1/
│   │   │   ├── suhaeng2/
│   │   │   └── suhaeng3/
│   │   └── modules/
│   ├── functions/
│   │   ├── submit.js
│   │   ├── download.js
│   │   └── gate-session2.js
│   └── netlify.toml
│
├── 🧪 testing/             # 테스트 환경 (개발 중인 기능)
│   ├── src/
│   │   ├── science-experiments/
│   │   │   └── suhaeng3-test/
│   │   └── modules/
│   ├── functions/
│   │   ├── submit_test.js
│   │   ├── download_test.js
│   │   └── gate-session2.js
│   └── netlify.toml
│
├── 📚 archives/            # 백업 및 아카이브
│   ├── versions/
│   │   ├── v1.0.0/         # 초기 버전
│   │   ├── v1.1.0/         # Phase 1 적용
│   │   ├── v1.2.0/         # Phase 2 적용
│   │   └── v1.3.0/         # 현재 개발 버전
│   ├── temps/              # 임시 파일들
│   │   ├── 수행1_연구윤리.html
│   │   ├── 수행2.html
│   │   ├── 수행3.html
│   │   └── 수행3-개선판.html
│   └── backups/            # 자동 백업
│       ├── daily/
│       ├── weekly/
│       └── releases/
│
├── 📖 docs/               # 문서화
│   ├── deployment/
│   ├── testing/
│   ├── api/
│   └── user-guides/
│
├── 🔧 scripts/            # 유틸리티 스크립트
│   ├── deploy.sh
│   ├── backup.sh
│   ├── rollback.sh
│   └── test.sh
│
├── ⚙️ config/             # 설정 파일들
│   ├── netlify.toml
│   ├── package.json
│   └── environment/
│
└── 📋 project/            # 프로젝트 관리
    ├── CHANGELOG.md
    ├── ROADMAP.md
    └── ISSUES.md
```

## 🔄 마이그레이션 계획

### Phase 1: 기본 구조 생성
1. 새로운 폴더 구조 생성
2. 기존 파일들을 적절한 위치로 이동
3. 설정 파일 분리 및 정리

### Phase 2: 배포 환경 분리
1. production 폴더에 안정화된 버전 배치
2. testing 폴더에 개발 중인 기능 배치
3. 각각 독립적인 netlify.toml 설정

### Phase 3: 백업 시스템 구축
1. 버전별 아카이브 시스템 구축
2. 자동 백업 스크립트 작성
3. 롤백 도구 개발

## 🚀 주요 개선사항

### 1. 명확한 역할 분리
- **production/**: 운영 환경 (안정성 우선)
- **testing/**: 개발 환경 (기능 테스트)
- **archives/**: 백업 및 버전 관리

### 2. 독립적인 배포 환경
- 각 환경별 독립적인 설정 파일
- 서로 다른 도메인/경로 사용 가능
- 독립적인 함수 및 모듈

### 3. 체계적인 백업 관리
- 버전별 아카이브
- 자동 백업 스크립트
- 쉬운 롤백 시스템

### 4. 향상된 개발 워크플로우
- 명확한 개발 → 테스트 → 배포 프로세스
- 버전 관리 및 변경 이력 추적
- 문서화된 가이드라인

## 📋 구현 단계

### 1단계: 구조 생성 및 파일 이동
```bash
# 새로운 구조 생성
mkdir -p production/src/science-experiments
mkdir -p testing/src/science-experiments
mkdir -p archives/{versions,temps,backups}
mkdir -p docs/{deployment,testing,api,user-guides}
mkdir -p scripts config project

# 기존 파일 이동
mv class-site/science-experiments/suhaeng3 production/src/science-experiments/
mv class-site/science-experiments/suhaeng3-test testing/src/science-experiments/
mv temps/* archives/temps/
```

### 2단계: 설정 파일 분리
- production/netlify.toml: 운영 환경 설정
- testing/netlify.toml: 테스트 환경 설정
- config/netlify.toml: 공통 설정

### 3단계: 스크립트 개발
- deploy.sh: 배포 자동화
- backup.sh: 백업 생성
- rollback.sh: 롤백 실행
- test.sh: 테스트 실행

## 🎯 예상 효과

### 개발 효율성
- 명확한 환경 분리로 혼동 방지
- 독립적인 테스트 환경으로 안전한 개발
- 체계적인 백업으로 실험적 개발 가능

### 운영 안정성
- 운영 환경과 개발 환경 완전 분리
- 롤백 시스템으로 빠른 문제 해결
- 버전 관리로 변경 이력 추적

### 유지보수성
- 명확한 폴더 구조로 코드 위치 파악 용이
- 문서화된 가이드라인으로 팀 협업 향상
- 자동화된 스크립트로 반복 작업 최소화

## 🔧 추가 도구 제안

### 1. 버전 관리 도구
```bash
# 버전 생성
./scripts/create-version.sh v1.2.0 "Phase 2 improvements"

# 롤백 실행
./scripts/rollback.sh v1.1.0

# 백업 생성
./scripts/backup.sh daily
```

### 2. 배포 자동화
```bash
# 테스트 환경 배포
./scripts/deploy.sh testing

# 운영 환경 배포
./scripts/deploy.sh production
```

### 3. 모니터링 도구
- 배포 상태 모니터링
- 테스트 결과 추적
- 백업 상태 확인

이러한 구조 개선을 통해 프로젝트의 안정성, 개발 효율성, 유지보수성을 크게 향상시킬 수 있습니다.
