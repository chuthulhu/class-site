# 프로젝트 구조 개선 구현 가이드

## 🎯 개요

현재 프로젝트의 구조를 개선하여 배포, 테스트, 백업 환경을 명확히 분리하고 체계적인 관리 시스템을 구축합니다.

## 📁 새로운 구조

```
class-site/
├── 📦 production/           # 배포 환경 (안정화된 버전)
├── 🧪 testing/             # 테스트 환경 (개발 중인 기능)
├── 📚 archives/            # 백업 및 아카이브
├── 📖 docs/               # 문서화
├── 🔧 scripts/            # 유틸리티 스크립트
├── ⚙️ config/             # 설정 파일들
└── 📋 project/            # 프로젝트 관리
```

## 🚀 구현 단계

### 1단계: 구조 생성 및 파일 이동

```bash
# 새로운 구조 생성
mkdir -p production/src/science-experiments
mkdir -p testing/src/science-experiments
mkdir -p archives/{versions,temps,backups/{daily,weekly,releases}}
mkdir -p docs/{deployment,testing,api,user-guides}
mkdir -p scripts config project

# 기존 파일 이동
cp -r class-site/science-experiments/suhaeng3 production/src/science-experiments/
cp -r class-site/science-experiments/suhaeng3-test testing/src/science-experiments/
cp -r temps/* archives/temps/
cp -r class-site/netlify/functions production/
cp -r class-site/science-experiments/modules production/src/
```

### 2단계: 설정 파일 분리

각 환경별로 독립적인 설정 파일을 생성합니다:

- `production/netlify.toml`: 운영 환경 설정
- `testing/netlify.toml`: 테스트 환경 설정
- `config/netlify.toml`: 공통 설정

### 3단계: 스크립트 개발

자동화 스크립트를 개발합니다:

- `scripts/deploy.sh`: 배포 자동화
- `scripts/backup.sh`: 백업 생성
- `scripts/rollback.sh`: 롤백 실행
- `scripts/test.sh`: 테스트 실행

## 🔧 주요 기능

### 1. 환경 분리

#### Production 환경
- 안정화된 운영 버전
- 최적화된 성능
- 보안 강화
- 모니터링 활성화

#### Testing 환경
- 개발 중인 기능
- 실시간 업데이트
- 디버깅 정보 포함
- 테스트 함수 사용

### 2. 백업 시스템

#### 자동 백업
- 일일 백업 (7일 보관)
- 주간 백업 (4주 보관)
- 릴리스 백업 (수동 관리)

#### 수동 백업
- 롤백 전 자동 백업
- 특정 시점 백업
- 환경별 백업

### 3. 자동화 스크립트

#### 배포 스크립트
```bash
# 테스트 환경 배포
./scripts/deploy.sh testing

# 운영 환경 배포
./scripts/deploy.sh production
```

#### 백업 스크립트
```bash
# 일일 백업
./scripts/backup.sh daily

# 주간 백업
./scripts/backup.sh weekly

# 릴리스 백업
./scripts/backup.sh release
```

#### 롤백 스크립트
```bash
# 특정 백업으로 롤백
./scripts/rollback.sh 20240215_143022_daily

# 환경별 롤백
./scripts/rollback.sh 20240215_143022_daily production
```

#### 테스트 스크립트
```bash
# 전체 테스트
./scripts/test.sh testing

# 특정 테스트
./scripts/test.sh testing unit
./scripts/test.sh testing integration
./scripts/test.sh testing e2e
```

## 📊 예상 효과

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

## 🔄 마이그레이션 계획

### Phase 1: 기본 구조 생성 (1주)
1. 새로운 폴더 구조 생성
2. 기존 파일들을 적절한 위치로 이동
3. 설정 파일 분리 및 정리

### Phase 2: 배포 환경 분리 (1주)
1. production 폴더에 안정화된 버전 배치
2. testing 폴더에 개발 중인 기능 배치
3. 각각 독립적인 netlify.toml 설정

### Phase 3: 백업 시스템 구축 (1주)
1. 버전별 아카이브 시스템 구축
2. 자동 백업 스크립트 작성
3. 롤백 도구 개발

### Phase 4: 테스트 및 검증 (1주)
1. 각 환경별 기능 테스트
2. 배포 프로세스 검증
3. 백업/롤백 시스템 테스트

## 🚨 주의사항

### 마이그레이션 전
- 현재 상태 백업
- 의존성 확인
- 설정 파일 검증

### 마이그레이션 중
- 단계별 진행
- 각 단계별 검증
- 문제 발생 시 즉시 중단

### 마이그레이션 후
- 전체 기능 테스트
- 성능 확인
- 문서 업데이트

## 📋 체크리스트

### 마이그레이션 전
- [ ] 현재 상태 백업
- [ ] 의존성 확인
- [ ] 설정 파일 검증
- [ ] 테스트 환경 준비

### 마이그레이션 중
- [ ] 구조 생성
- [ ] 파일 이동
- [ ] 설정 분리
- [ ] 스크립트 개발

### 마이그레이션 후
- [ ] 기능 테스트
- [ ] 성능 확인
- [ ] 문서 업데이트
- [ ] 팀 교육

## 🔗 관련 문서

- [프로젝트 구조 제안](PROJECT_STRUCTURE_PROPOSAL.md)
- [배포 가이드](docs/deployment/README.md)
- [테스트 가이드](docs/testing/README.md)
- [프로젝트 로드맵](project/ROADMAP.md)
- [이슈 트래킹](project/ISSUES.md)

## 🎯 성공 지표

### 기술적 지표
- 환경 분리 완료율: 100%
- 자동화 스크립트 작동률: 100%
- 백업 시스템 안정성: 99.9%

### 비즈니스 지표
- 배포 시간 단축: 50%
- 롤백 시간 단축: 80%
- 개발 효율성 향상: 30%

이러한 구조 개선을 통해 프로젝트의 안정성, 개발 효율성, 유지보수성을 크게 향상시킬 수 있습니다.
