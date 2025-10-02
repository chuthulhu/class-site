# 배포 가이드

## 🚀 배포 환경 개요

프로젝트는 두 가지 환경으로 구성되어 있습니다:

- **Production**: 안정화된 운영 환경
- **Testing**: 개발 및 테스트 환경

## 📁 환경별 구조

### Production 환경
```
production/
├── src/
│   └── science-experiments/
│       ├── suhaeng1/
│       ├── suhaeng2/
│       └── suhaeng3/
├── functions/
│   ├── submit.js
│   ├── download.js
│   └── gate-session2.js
├── netlify.toml
└── package.json
```

### Testing 환경
```
testing/
├── src/
│   └── science-experiments/
│       └── suhaeng3-test/
├── functions/
│   ├── submit_test.js
│   ├── download_test.js
│   └── gate-session2.js
├── netlify.toml
└── package.json
```

## 🔧 배포 방법

### 1. 자동 배포 (권장)

```bash
# 테스트 환경 배포
./scripts/deploy.sh testing

# 운영 환경 배포
./scripts/deploy.sh production
```

### 2. 수동 배포

```bash
# 환경별로 디렉토리 이동
cd production  # 또는 testing

# Netlify CLI를 사용한 배포
netlify deploy --prod
```

## ⚙️ 환경별 설정

### Production 설정
- 안정성 우선
- 캐싱 최적화
- 모니터링 활성화
- 보안 강화

### Testing 설정
- 개발 편의성 우선
- 실시간 업데이트
- 디버깅 정보 포함
- 테스트 함수 사용

## 🔄 배포 워크플로우

1. **개발**: Testing 환경에서 기능 개발
2. **테스트**: Testing 환경에서 검증
3. **배포**: Production 환경으로 승격
4. **모니터링**: 운영 상태 확인

## 📊 배포 상태 확인

### Production
- URL: `https://your-production-site.netlify.app`
- 상태: 운영 중
- 버전: v1.0.0

### Testing
- URL: `https://your-testing-site.netlify.app`
- 상태: 개발 중
- 버전: v1.2.0

## 🚨 문제 해결

### 배포 실패 시
1. 로그 확인: `netlify logs`
2. 설정 검증: `netlify status`
3. 롤백: `./scripts/rollback.sh <backup_name>`

### 환경 불일치 시
1. 설정 파일 비교
2. 의존성 확인
3. 함수 상태 검증

## 📋 체크리스트

### 배포 전
- [ ] 테스트 통과 확인
- [ ] 설정 파일 검증
- [ ] 의존성 업데이트
- [ ] 백업 생성

### 배포 후
- [ ] 서비스 상태 확인
- [ ] 기능 테스트
- [ ] 성능 모니터링
- [ ] 로그 확인
