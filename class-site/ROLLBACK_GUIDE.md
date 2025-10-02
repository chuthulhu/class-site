# 롤백 가이드

## Phase 1 & Phase 2 변경사항 롤백 방법

Phase 1과 Phase 2에서 적용된 변경사항을 되돌리려면 다음 단계를 따르세요.

## 롤백 단계

### 1. 서버 측 파일 복원
```bash
# submit.js를 Phase 1 이전 상태로 복원
cp "class-site/netlify/functions/submit.js.backup" "class-site/netlify/functions/submit.js"
```

### 2. 클라이언트 측 파일 복원
```bash
# index.html을 Phase 1 이전 상태로 복원
cp "class-site/science-experiments/suhaeng3/index.html.backup" "class-site/science-experiments/suhaeng3/index.html"
```

### 3. Phase 2에서 생성된 파일들 제거
```bash
# 모듈 파일들 제거
rm -rf "class-site/science-experiments/suhaeng3/modules/"

# PWA 파일들 제거
rm "class-site/science-experiments/suhaeng3/sw.js"
rm "class-site/science-experiments/suhaeng3/manifest.json"

# 백업 파일들 제거 (선택사항)
rm "class-site/netlify/functions/submit.js.phase1"
rm "class-site/science-experiments/suhaeng3/index.html.phase1"
```

### 4. 생성된 문서 파일 제거 (선택사항)
```bash
# Phase 1, 2에서 생성된 문서 파일들 제거
rm "PHASE1_CHANGES.md"
rm "PHASE2_CHANGES.md"
rm "ROLLBACK_GUIDE.md"
```

## 롤백 후 확인사항

1. **서버 기능 확인**
   - 파일 업로드 기능이 정상 작동하는지 확인
   - 환경변수 검증이 제거되었는지 확인
   - 로깅이 기본 상태로 돌아갔는지 확인
   - 동적 청크 크기가 제거되었는지 확인

2. **클라이언트 기능 확인**
   - 파일 다운로드 기능이 정상 작동하는지 확인
   - 하드코딩된 SUBMIT_KEY가 복원되었는지 확인
   - 모듈 시스템이 제거되었는지 확인
   - Service Worker가 제거되었는지 확인
   - PWA 기능이 제거되었는지 확인

3. **테스트**
   - 전체 업로드 프로세스 테스트
   - 오류 상황 테스트
   - 다양한 파일 크기 테스트
   - 오프라인 상태 테스트

## 롤백 단계별 옵션

### Phase 2만 롤백 (Phase 1 유지)
```bash
# Phase 2 백업으로 복원
cp "class-site/netlify/functions/submit.js.phase1" "class-site/netlify/functions/submit.js"
cp "class-site/science-experiments/suhaeng3/index.html.phase1" "class-site/science-experiments/suhaeng3/index.html"

# Phase 2 파일들만 제거
rm -rf "class-site/science-experiments/suhaeng3/modules/"
rm "class-site/science-experiments/suhaeng3/sw.js"
rm "class-site/science-experiments/suhaeng3/manifest.json"
```

### Phase 1만 롤백 (원본 상태로)
```bash
# 원본 백업으로 복원
cp "class-site/netlify/functions/submit.js.backup" "class-site/netlify/functions/submit.js"
cp "class-site/science-experiments/suhaeng3/index.html.backup" "class-site/science-experiments/suhaeng3/index.html"
```

## 주의사항

- 롤백 전에 현재 데이터를 백업하세요
- 롤백 후에는 모든 기능을 다시 테스트하세요
- 환경변수 설정이 올바른지 확인하세요
- Service Worker 캐시를 브라우저에서 수동으로 지워야 할 수 있습니다

## 문제 해결

롤백 후 문제가 발생하면:
1. 브라우저 캐시를 지우세요
2. Service Worker를 브라우저 개발자 도구에서 제거하세요
3. 서버를 재시작하세요
4. 환경변수를 다시 확인하세요
5. 로그를 확인하여 오류를 진단하세요

## Service Worker 캐시 수동 제거

브라우저 개발자 도구에서:
1. Application 탭 열기
2. Storage 섹션에서 "Clear storage" 클릭
3. 또는 Service Workers 섹션에서 "Unregister" 클릭
