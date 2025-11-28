# 멀티 사이트 배포 가이드

## 🎯 개요

이 프로젝트는 **하나의 GitHub 저장소**에서 **두 개의 독립적인 Netlify 사이트**를 배포하는 구조를 사용합니다.

### 📊 현재 배포 사이트

| 사이트 | 환경 | URL | 프로젝트 ID | 상태 |
|--------|------|-----|-------------|------|
| **physichu** | Production | `https://physichu.netlify.app` | `feccbb89-1fa6-4259-a989-5f65c2fccf70` | ✅ 운영 중 |
| **test-physichu** | Testing | `https://test-physichu.netlify.app` | `6ef7b019-bc3f-4adb-8767-b610a93f9915` | ✅ 테스팅 중 |

## 🏗️ 구조적 특징

### ✅ 장점

1. **완전한 환경 분리**
   - 각 사이트가 독립적인 설정과 함수 사용
   - 한 환경의 변경이 다른 환경에 영향 없음

2. **효율적인 개발 워크플로우**
   - 테스트 → 운영 승격 프로세스 지원
   - 실시간 개발 및 검증 가능

3. **비용 효율성**
   - 하나의 GitHub 저장소로 여러 환경 관리
   - 중복 코드 최소화

### ⚠️ 주의사항

1. **배포 트리거 충돌**
   - GitHub 푸시 시 두 사이트 모두 배포 트리거됨
   - 각 환경의 `netlify.toml`에서 독립적인 `base` 디렉토리 설정 필요

2. **설정 파일 관리**
   - 각 환경의 `netlify.toml` 파일을 독립적으로 관리
   - 환경별로 다른 함수 디렉토리 사용 유지

3. **함수 충돌 방지**
   - Production: `class-site/netlify/functions/`
   - Testing: `testing/functions/`

## 🔧 설정 파일 구조

### Production 환경 (`netlify.toml` - 루트)

```toml
[build]
  base    = "class-site"
  publish = "."

[functions]
  directory = "class-site/netlify/functions"
  node_bundler = "esbuild"

# Edge Functions routing
[[edge_functions]]
path = "/science-experiments/suhaeng3/session2"
function = "gate-session2"

# Headers
[[headers]]
for = "/science-experiments/suhaeng3/index.html"
  [headers.values]
  Cache-Control = "no-store"
```

### Testing 환경 (`testing/netlify.toml`)

```toml
[build]
  base    = "testing"
  publish = "src"

[functions]
  directory = "functions"
  node_bundler = "esbuild"

# Testing-specific routing
[[edge_functions]]
path = "/science-experiments/suhaeng3-test/session2"
function = "gate-session2"

# Testing-specific headers
[[headers]]
for = "/science-experiments/suhaeng3-test/index.html"
  [headers.values]
  Cache-Control = "no-store"

[[headers]]
for = "/*"
  [headers.values]
  X-Environment = "testing"
  X-Version = "1.2.0"
  X-Testing = "true"
```

## 🚀 배포 워크플로우

### 1. 개발 프로세스

```bash
# 1. 테스트 환경에서 개발
cd testing
# 코드 수정 후
git add . && git commit -m "feature: 새로운 기능"
git push

# 2. 테스트 환경에서 검증
# https://test-physichu.netlify.app 접속하여 테스트

# 3. 운영 환경으로 승격 (필요시)
cd ..
# 검증된 코드를 운영 환경에 적용
git push  # 운영 환경도 자동 배포됨
```

### 2. 환경별 수동 배포

#### Production 환경 배포
```bash
# 루트 디렉토리에서
netlify link --id feccbb89-1fa6-4259-a989-5f65c2fccf70
netlify deploy --prod
```

#### Testing 환경 배포
```bash
# testing 디렉토리에서
cd testing
netlify link --id 6ef7b019-bc3f-4adb-8767-b610a93f9915
netlify deploy --prod
```

## 🔍 모니터링 및 관리

### 상태 확인 명령어

```bash
# 현재 연결된 사이트 확인
netlify status

# 모든 사이트 목록 확인
netlify sites:list

# 관리자 대시보드 열기
netlify open --admin

# 사이트별 상태 확인
netlify status --site physichu
netlify status --site test-physichu
```

### 로그 확인

```bash
# 현재 사이트 로그 확인
netlify logs

# 특정 사이트 로그 확인
netlify logs --site physichu
netlify logs --site test-physichu
```

## 🚨 문제 해결

### 일반적인 문제들

#### 1. 배포 트리거 충돌
- **증상**: GitHub 푸시 시 예상치 못한 사이트 배포
- **해결**: 각 환경의 `netlify.toml`에서 독립적인 `base` 디렉토리 설정 확인

#### 2. 설정 파일 충돌
- **증상**: 잘못된 `netlify.toml` 파일 참조
- **해결**: 환경별로 올바른 디렉토리에서 배포 실행

#### 3. 함수 충돌
- **증상**: 같은 함수 이름 사용 시 충돌
- **해결**: 환경별로 독립적인 함수 디렉토리 사용

### 긴급 상황 대응

#### SSL 인증서 문제
```bash
# 환경 변수 설정 후 재시도
$env:NODE_TLS_REJECT_UNAUTHORIZED=0
netlify login
```

#### 배포 실패 시
```bash
# 1. 현재 상태 확인
netlify status

# 2. 설정 파일 검증
cat netlify.toml  # 또는 testing/netlify.toml

# 3. 수동 배포 시도
netlify deploy --prod --dir=src
```

#### 롤백 실행
```bash
# 각 환경별 독립적인 롤백
cd testing && netlify rollback
cd .. && netlify rollback
```

## 📋 체크리스트

### 배포 전 확인사항
- [ ] 각 환경별 독립적인 `netlify.toml` 파일 존재
- [ ] 서로 다른 `base` 디렉토리 설정 확인
- [ ] 독립적인 함수 디렉토리 설정 확인
- [ ] 환경별 고유한 프로젝트 ID 확인
- [ ] 테스트 환경에서 기능 검증 완료

### 배포 후 확인사항
- [ ] Production 사이트 정상 접속: `https://physichu.netlify.app`
- [ ] Testing 사이트 정상 접속: `https://test-physichu.netlify.app`
- [ ] 각 환경별 기능 테스트 완료
- [ ] 로그에서 오류 없음 확인
- [ ] 성능 모니터링 정상

## 🎯 결론

현재 구조는 **하나의 GitHub 저장소에서 두 개의 독립적인 Netlify 사이트를 안전하게 배포**하는 매우 안정적인 구조입니다.

### ✅ 장점
- **완전한 환경 분리**: 각 사이트가 독립적인 설정과 함수 사용
- **안전한 배포**: 한 환경의 변경이 다른 환경에 영향 없음
- **효율적인 개발**: 테스트 → 운영 승격 워크플로우 지원
- **비용 효율성**: 하나의 GitHub 저장소로 여러 환경 관리

### ⚠️ 주의사항
- GitHub 푸시 시 두 사이트 모두 배포 트리거됨
- 각 환경의 `netlify.toml` 파일을 독립적으로 관리 필요
- 환경별로 다른 함수 디렉토리 사용 유지 필요

**특별한 문제가 발생할 소지는 거의 없으며**, 현재 구조를 그대로 유지하면서 개발을 진행하시면 됩니다! 🚀
