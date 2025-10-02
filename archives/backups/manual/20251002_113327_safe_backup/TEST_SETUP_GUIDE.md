# 테스트 환경 설정 가이드

## 개요
suhaeng3-test 폴더는 기존 suhaeng3와 독립적으로 테스트할 수 있도록 별도의 서버리스 함수를 사용합니다.

## 테스트용 함수들

### 1. submit_test.js
- **경로**: `/.netlify/functions/submit_test`
- **기능**: Phase 1 & Phase 2 개선사항이 포함된 파일 업로드 함수
- **특징**:
  - 환경변수 검증 강화
  - 구조화된 로깅 시스템
  - 동적 청크 크기 계산
  - 향상된 오류 처리
  - 파일명 정리 함수 개선

### 2. download_test.js
- **경로**: `/.netlify/functions/download_test`
- **기능**: 테스트용 파일 다운로드 함수
- **특징**: 기존 download.js와 동일한 기능

## 파일 구조

```
class-site/
├── netlify/functions/
│   ├── submit.js          # 원본 (롤백됨)
│   ├── submit_test.js     # 테스트용 (개선사항 포함)
│   ├── download.js        # 원본
│   └── download_test.js   # 테스트용
├── science-experiments/
│   ├── suhaeng3/          # 원본 (롤백됨)
│   └── suhaeng3-test/     # 테스트용 (개선사항 포함)
│       ├── modules/        # 모듈 시스템
│       ├── sw.js          # Service Worker
│       ├── manifest.json  # PWA 매니페스트
│       └── index.html     # 개선된 UI
└── netlify.toml           # 라우팅 설정
```

## 사용 방법

### 1. 원본 환경 (suhaeng3)
- **URL**: `/science-experiments/suhaeng3/`
- **함수**: `submit.js`, `download.js`
- **상태**: 원본 상태 (롤백됨)

### 2. 테스트 환경 (suhaeng3-test)
- **URL**: `/science-experiments/suhaeng3-test/`
- **함수**: `submit_test.js`, `download_test.js`
- **상태**: Phase 1 & Phase 2 개선사항 적용

## 주요 개선사항

### Phase 1 (보안 강화)
- ✅ 환경변수 검증
- ✅ 구조화된 로깅
- ✅ 파일 검증 강화
- ✅ 파일명 정리

### Phase 2 (사용자 경험)
- ✅ 모듈 시스템
- ✅ PWA 지원
- ✅ 진행 상태 표시
- ✅ 동적 청크 크기
- ✅ 오프라인 지원

## 테스트 시나리오

### 1. 기본 기능 테스트
- 파일 업로드/다운로드
- 폼 검증
- 오류 처리

### 2. 성능 테스트
- 대용량 파일 업로드
- 청크 업로드 최적화
- 네트워크 오류 복구

### 3. PWA 테스트
- 오프라인 모드
- 앱 설치
- Service Worker 동작

### 4. 모바일 테스트
- iOS Safari
- Android Chrome
- 인앱 브라우저

## 롤백 방법

### 원본으로 롤백
```bash
# submit.js를 원본으로 복원
cp "class-site/netlify/functions/submit.js.backup" "class-site/netlify/functions/submit.js"

# suhaeng3를 원본으로 복원
cp "class-site/science-experiments/suhaeng3/index.html.backup" "class-site/science-experiments/suhaeng3/index.html"
```

### 테스트 환경 제거
```bash
# 테스트 함수들 제거
rm "class-site/netlify/functions/submit_test.js"
rm "class-site/netlify/functions/download_test.js"

# 테스트 폴더 제거
rm -rf "class-site/science-experiments/suhaeng3-test/"
```

## 환경변수

테스트 함수들은 동일한 환경변수를 사용합니다:
- `SUBMIT_KEY`
- `MS_TENANT_ID`
- `MS_CLIENT_ID`
- `MS_CLIENT_SECRET`
- `MS_REFRESH_TOKEN`

## 주의사항

1. **독립성**: 테스트 환경은 원본에 영향을 주지 않습니다
2. **환경변수**: 동일한 환경변수를 공유합니다
3. **데이터**: 테스트 데이터는 별도로 관리됩니다
4. **배포**: 테스트 함수들도 함께 배포됩니다

## 문제 해결

### 함수가 작동하지 않는 경우
1. netlify.toml 설정 확인
2. 환경변수 설정 확인
3. 함수 파일 존재 여부 확인

### 모듈 로딩 오류
1. 브라우저 콘솔 확인
2. 모듈 파일 경로 확인
3. Service Worker 등록 확인

### 업로드 실패
1. 파일 크기 제한 확인
2. 네트워크 연결 확인
3. 서버 로그 확인
