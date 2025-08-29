# Class-Site 프로젝트 문서

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [프로젝트 목표](#프로젝트-목표)
3. [프로젝트 구조](#프로젝트-구조)
4. [핵심 기능 상세](#핵심-기능-상세)
5. [환경 변수 설정](#환경-변수-설정)
6. [API 엔드포인트](#api-엔드포인트)
7. [앞으로의 작업 계획 및 제안사항](#앞으로의-작업-계획-및-제안사항)
8. [프로젝트 관리 문서](#프로젝트-관리-문서)

## 프로젝트 개요

**레포지토리**: chuthulhu/class-site  
**배포 플랫폼**: Netlify  
**핵심 기능**: 학생 제출 파일을 Microsoft OneDrive에 업로드하는 서버리스 함수  
**기술 스택**: Node.js (ESM), Microsoft Graph API, Netlify Functions  

## 프로젝트 목표

학생들이 제출한 파일들을 교사(조직 Microsoft 계정)의 OneDrive에 안전하고 체계적으로 저장하는 시스템 구축.

### 주요 목표
- **안전한 파일 업로드**: 확장자, 용량, 내용 검증을 통한 보안 강화
- **다중 파일 지원**: 최대 5개 파일, 총 300MB 제한
- **자동 폴더 구조화**: `/과제제출/{subject}/{section}/{studentId}/파일명` 형식
- **중복 처리**: 동일 파일명 시 타임스탬프 접미사 자동 부착
- **청크 업로드**: 10MB 초과 파일에 대한 효율적인 대용량 전송

### 🎯 **현재 우선 목표: suhaeng3 자동 제출 기능**

**대상**: `science-experiments/suhaeng3/index.html`
**기능**: ZIP/PDF 생성 시 자동으로 OneDrive에 업로드
**완료 목표일**: 2025년 9월 1일

#### 구현 내용
- 학생 정보 입력 폼 추가 (학번, 과목, 반)
- ZIP 생성과 동시에 OneDrive 업로드
- 제출 상태 실시간 표시
- 에러 처리 및 재시도 기능

## 프로젝트 구조

```
class-site/
├── netlify.toml                 # Netlify 배포 설정
├── class-site/                  # 메인 애플리케이션 디렉토리
│   ├── package.json            # Node.js 설정 (ESM 모드)
│   ├── index.html              # 메인 페이지
│   ├── netlify/
│   │   └── functions/
│   │       └── submit.js       # 핵심 업로드 함수
│   └── science-experiments/    # 실험 관련 페이지들
├── temps/                      # 임시 파일들
└── README.md                   # 프로젝트 문서
```

## 핵심 기능 상세

### 1. 파일 업로드 정책
- **허용 확장자**: pdf, html, htm, jpg, jpeg, png, csv, txt, zip, hwp, hwpx, ppt, pptx, xlsx, mp4
- **형식별 용량 제한**:
  - hwp/hwpx: 10MB
  - ppt/pptx: 40MB
  - xlsx: 5MB
  - pdf: 20MB
  - html/htm: 5MB
  - jpg/jpeg/png: 8MB
  - csv/txt: 2MB
  - zip: 50MB
  - mp4: 300MB
- **제출 제한**: 최대 5개 파일, 총합 300MB

### 2. 인증 및 보안
- **API 인증**: X-Submission-Key 헤더 검증
- **Microsoft OAuth**: Delegated 권한으로 교사 OneDrive 접근
- **토큰 관리**: Refresh Token을 통한 Access Token 자동 갱신
- **범위**: offline_access, Files.ReadWrite, openid, profile, User.Read

### 3. 업로드 방식
- **≤10MB**: 단일 PUT 요청
- **>10MB**: createUploadSession을 통한 청크 업로드 (8MiB 단위)
- **재시도 로직**: 네트워크 오류 시 최대 3회 재시도 (백오프 적용)

### 4. 폴더 관리
- **자동 폴더 생성**: 필요한 경로 계층 구조 자동 생성
- **경로 인코딩**: Colon addressing을 통한 특수문자 처리
- **중복 파일명**: 타임스탬프 접미사 (`_YYYYMMDD_HHmmss`) 자동 부착

## 환경 변수 설정

Netlify UI에서 다음 환경변수들을 설정해야 합니다:

```bash
SUBMIT_KEY=<제출 인증 키>
MS_TENANT_ID=<Microsoft 테넌트 ID>
MS_CLIENT_ID=<Microsoft 클라이언트 ID>
MS_CLIENT_SECRET=<Microsoft 클라이언트 시크릿>
MS_REFRESH_TOKEN=<Microsoft 리프레시 토큰>
ROOT_FOLDER_PATH=/과제제출
```

## API 엔드포인트

### POST /.netlify/functions/submit

학생 파일 제출을 위한 메인 엔드포인트.

#### 요청 형식
```json
{
  "studentId": "10207",
  "subject": "physics1",
  "section": "102",
  "files": [
    {
      "filename": "assignment.pdf",
      "contentBase64": "<base64-encoded-content>",
      "mime": "application/pdf"
    }
  ]
}
```

#### 응답 형식
```json
{
  "ok": true,
  "studentId": "10207",
  "subject": "physics1",
  "section": "102",
  "submittedAt": "2024-01-15T10:30:00.000Z",
  "files": [
    {
      "name": "assignment.pdf",
      "size": 1024000,
      "webUrl": "https://onedrive.live.com/...",
      "chunked": false
    }
  ]
}
```

## 앞으로의 작업 계획 및 제안사항

### 우선순위 1: submit.js 리뷰 및 안전성 점검
- [ ] 단일/다중 모드 처리 로직 검증
- [ ] 검증 로직(확장자·용량·총합·매직넘버) 정확성 확인
- [ ] 중복 네이밍 및 청크 업로드 분기 로직 검토
- [ ] 에러 응답 스키마 통일 (HTTP status + { ok:false, error, detail })
- [ ] OneDrive 경로 인코딩(Colon addressing) 안전성 재확인
- [ ] 네트워크/429/5xx 재시도 백오프 로직 점검 (청크 업로드 루프 내 최대 3회)

### 우선순위 2: 로깅 및 관측성 강화
- [ ] console.error에 추적 가능한 에러코드/컨텍스트 추가 (과목·반·학번·확장자·바이트수)
- [ ] 경량 요청 로그 추가 (파일 수/총합 크기, PII 최소화)
- [ ] 에러 추적을 위한 구조화된 로깅 구현

### 우선순위 3: 보안 및 안전성 강화
- [ ] 파일명 sanitize 로직 검증 (경로문자·제어문자 제거)
- [ ] HTML/JS 실행파일 차단 메커니즘 확인
- [ ] MIME 불일치 시 415 처리 로직 유지
- [ ] 환경변수 사용 고정 및 비밀정보 커밋 방지 검증

### 우선순위 4: 배포 파이프라인 최적화
- [ ] netlify.toml UTF-8 with no BOM 확인
- [ ] Functions bundler/esbuild ESM 호환성 검증
- [ ] "Clear cache and deploy" 가이드 반영 (캐시 영향 최소화)

### 우선순위 5: 개발자 경험 개선
- [ ] README_submission.md 생성 (요청/응답 스키마, 허용 확장자/용량표, 테스트 방법, 에러 코드표)
- [ ] scripts/test-submit.ps1 스크립트 추가 (로컬 모의 호출)
- [ ] 테스트 시나리오별 재현 절차 및 예상 응답 체크리스트 작성

### 제안사항

1. **성능 최적화**: 대용량 파일 청크 업로드 시 타임아웃 리스크 고려
   - 제안: CHUNK_SIZE 조정 또는 Background Functions 고려

2. **모니터링 강화**: 업로드 성공/실패율 추적을 위한 메트릭 추가
   - 제안: Netlify Analytics 또는 외부 모니터링 서비스 연동

3. **테스트 자동화**: 단위 테스트 및 통합 테스트 스위트 구축
   - 제안: Jest 또는 Mocha 프레임워크 도입

4. **문서화 개선**: API 문서를 OpenAPI/Swagger 형식으로 변환
   - 제안: swagger-jsdoc 라이브러리 활용

5. **보안 감사**: 정기적인 보안 취약점 스캔 수행
   - 제안: Snyk 또는 OWASP ZAP 도구 활용

---

## 📋 프로젝트 관리 문서

> 📋 **상세 작업 계획 및 진행 상황은 [PROJECT_PLAN.md](PROJECT_PLAN.md)를 참조하세요**

> 📋 **수행한 작업 내역은 [PROJECT_PLAN.md](PROJECT_PLAN.md)를 참조하세요**
