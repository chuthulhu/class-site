# 배포 가이드

## 🚀 배포 환경 개요

프로젝트는 **하나의 GitHub 저장소**에서 **두 개의 독립적인 Netlify 사이트**를 배포하는 구조입니다:

- **Production (physichu)**: 안정화된 운영 환경
- **Testing (test-physichu)**: 개발 및 테스트 환경

### 📊 현재 배포 사이트 정보

| 환경 | 사이트 이름 | URL | 프로젝트 ID | 상태 |
|------|-------------|-----|-------------|------|
| **Production** | `physichu` | `https://physichu.netlify.app` | `feccbb89-1fa6-4259-a989-5f65c2fccf70` | ✅ 운영 중 |
| **Testing** | `test-physichu` | `https://test-physichu.netlify.app` | `6ef7b019-bc3f-4adb-8767-b610a93f9915` | ✅ 테스팅 중 |

## 📁 환경별 구조

### 🏠 루트 구조 (현재 운영 중)
```
class-site/
├── science-experiments/
│   ├── suhaeng1/
│   ├── suhaeng2/
│   └── suhaeng3/              # 운영 환경
├── netlify/
│   └── functions/
│       ├── submit.js           # 운영용 함수
│       ├── download.js         # 운영용 함수
│       └── gate-session2.js
├── netlify.toml               # 운영 환경 설정
└── package.json
```

### 🧪 Testing 환경 (독립 배포)
```
testing/
├── src/
│   └── science-experiments/
│       └── suhaeng3-test/     # 테스트 환경
├── functions/
│   ├── submit_test.js         # 테스트용 함수
│   ├── download_test.js       # 테스트용 함수
│   └── gate-session2.js
├── netlify.toml              # 테스트 환경 설정
└── package.json
```

### 🔧 설정 파일 차이점

| 설정 | Production | Testing |
|------|------------|---------|
| **Base Directory** | `class-site` | `testing` |
| **Publish Directory** | `.` | `src` |
| **Functions Directory** | `class-site/netlify/functions` | `functions` |
| **Edge Functions** | `/science-experiments/suhaeng3/session2` | `/science-experiments/suhaeng3-test/session2` |

## 🔧 배포 방법

### 1. GitHub 자동 배포 (권장)

```bash
# 모든 변경사항을 GitHub에 푸시
git add .
git commit -m "feature: 새로운 기능 추가"
git push

# 자동으로 두 사이트 모두 배포됨:
# - physichu.netlify.app (운영 환경)
# - test-physichu.netlify.app (테스트 환경)
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

## ⚙️ 환경별 설정

### Production 환경 (physichu)
- **안정성 우선**: 검증된 기능만 배포
- **캐싱 최적화**: 성능 향상을 위한 캐시 설정
- **보안 강화**: 운영 환경 보안 정책 적용
- **모니터링**: 실시간 상태 모니터링

### Testing 환경 (test-physichu)
- **개발 편의성**: 실시간 업데이트 및 디버깅
- **테스트 함수**: `submit_test.js`, `download_test.js` 사용
- **디버깅 정보**: 상세한 로그 및 오류 정보
- **실험적 기능**: 새로운 기능 테스트

## 🔄 배포 워크플로우

### 📋 권장 개발 프로세스

1. **개발**: `testing/` 환경에서 기능 개발
2. **테스트**: `https://test-physichu.netlify.app`에서 검증
3. **승격**: 검증된 코드를 운영 환경에 적용
4. **모니터링**: 두 환경 모두 상태 확인

### 🚀 일상적인 개발 워크플로우

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

## 📊 배포 상태 확인

### Production 환경
- **URL**: `https://physichu.netlify.app`
- **상태**: ✅ 운영 중
- **버전**: v1.3.0
- **관리**: `https://app.netlify.com/projects/physichu`

### Testing 환경
- **URL**: `https://test-physichu.netlify.app`
- **상태**: ✅ 테스팅 중
- **버전**: v1.2.0
- **관리**: `https://app.netlify.com/projects/test-physichu`

### 🔍 상태 모니터링 명령어

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

## 🚨 문제 해결

### ⚠️ 주요 유의사항

#### 1. 배포 트리거 충돌
- **문제**: GitHub 푸시 시 두 사이트 모두 배포 트리거됨
- **해결**: 각 환경의 `netlify.toml`에서 독립적인 `base` 디렉토리 설정
- **확인**: `netlify status`로 현재 연결된 사이트 확인

#### 2. 설정 파일 충돌
- **문제**: 잘못된 `netlify.toml` 파일 참조
- **해결**: 환경별로 올바른 디렉토리에서 배포 실행
- **확인**: 각 환경의 설정 파일 경로 검증

#### 3. 함수 충돌 방지
- **문제**: 같은 함수 이름 사용 시 충돌 가능
- **해결**: 환경별로 독립적인 함수 디렉토리 사용
- **확인**: Production은 `class-site/netlify/functions/`, Testing은 `testing/functions/`

### 🔧 배포 실패 시 대응

#### 1. 로그 확인
```bash
# 현재 사이트 로그 확인
netlify logs

# 특정 사이트 로그 확인
netlify logs --site physichu
netlify logs --site test-physichu
```

#### 2. 설정 검증
```bash
# 현재 설정 확인
netlify status

# 설정 파일 검증
netlify deploy --dry-run
```

#### 3. 롤백 실행
```bash
# 각 환경별 독립적인 롤백
cd testing && netlify rollback
cd .. && netlify rollback
```

### 🚨 긴급 상황 대응

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

## 📋 체크리스트

### 🔍 배포 전 확인사항
- [ ] 각 환경별 독립적인 `netlify.toml` 파일 존재
- [ ] 서로 다른 `base` 디렉토리 설정 확인
- [ ] 독립적인 함수 디렉토리 설정 확인
- [ ] 환경별 고유한 프로젝트 ID 확인
- [ ] 테스트 환경에서 기능 검증 완료

### ✅ 배포 후 확인사항
- [ ] Production 사이트 정상 접속: `https://physichu.netlify.app`
- [ ] Testing 사이트 정상 접속: `https://test-physichu.netlify.app`
- [ ] 각 환경별 기능 테스트 완료
- [ ] 로그에서 오류 없음 확인
- [ ] 성능 모니터링 정상

### 🚨 긴급 상황 체크리스트
- [ ] `netlify status`로 현재 연결된 사이트 확인
- [ ] 각 환경의 설정 파일 경로 검증
- [ ] 함수 디렉토리 충돌 여부 확인
- [ ] SSL 인증서 문제 시 환경 변수 설정
- [ ] 필요시 각 환경별 독립적인 롤백 실행

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
