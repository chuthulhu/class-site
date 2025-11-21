# 문서 구조 가이드

## 📁 전체 문서 구조

```
class-site/
├── docs/                           # 📚 통합 문서 센터
│   ├── README.md                  # 문서 센터 메인
│   ├── teacher-key-guide.md       # 교사키 기능 가이드
│   ├── TEACHER_KEY_FIX.md         # 교사키 수정 이력
│   ├── TEACHER_KEY_TEST.md         # 교사키 테스트 가이드
│   ├── NETLIFY_DEPLOY_FIX.md      # Netlify 배포 오류 해결
│   ├── suhaeng3-user-guide.md     # suhaeng3 사용자 가이드
│   ├── suhaeng3-test-guide.md     # suhaeng3 테스트 가이드
│   ├── suhaeng3-user-manual.md    # suhaeng3 사용자 매뉴얼
│   ├── api/                       # API 문서
│   │   └── README.md
│   ├── deployment/                # 배포 가이드
│   │   └── README.md
│   ├── testing/                   # 테스트 가이드
│   │   ├── README.md
│   │   └── TEST_SETUP_GUIDE.md
│   └── user-guides/               # 사용자 가이드
│       └── README.md
├── project/                       # 📋 프로젝트 관리 문서
│   ├── README.md                  # 프로젝트 메인
│   ├── CHANGELOG.md               # 통합 변경 이력
│   ├── ROADMAP.md                 # 프로젝트 로드맵
│   ├── ISSUES.md                  # 이슈 트래킹
│   ├── PROJECT.md                 # 프로젝트 상세
│   ├── PROJECT_PLAN.md            # 프로젝트 계획
│   ├── MIGRATION_COMPLETE.md      # 마이그레이션 완료 보고
│   ├── api.md                     # API 문서 (이동됨)
│   ├── configuration.md           # 설정 문서 (이동됨)
│   ├── deployment.md              # 배포 문서 (이동됨)
│   ├── PHASE1_CHANGES.md          # Phase 1 변경사항
│   ├── PHASE2_CHANGES.md          # Phase 2 변경사항
│   ├── ROLLBACK_GUIDE.md          # 롤백 가이드
│   ├── TEST_GUIDE_suhaeng3.md     # suhaeng3 테스트 가이드
│   ├── README_suhaeng3.md         # suhaeng3 README
│   ├── IMPLEMENTATION_GUIDE.md    # 구현 가이드
│   ├── PROJECT_STRUCTURE_PROPOSAL.md # 구조 제안
│   ├── SAFE_MIGRATION_PLAN.md     # 안전한 마이그레이션 계획
│   └── QUICK_START_GUIDE.md       # 빠른 시작 가이드
└── scripts/                       # 🔧 자동화 스크립트
    ├── backup.sh                  # 백업 스크립트
    ├── rollback.sh                # 롤백 스크립트
    ├── deploy.sh                  # 배포 스크립트
    ├── test.sh                    # 테스트 스크립트
    ├── safe-backup.sh             # 안전한 백업 스크립트
    ├── migrate-structure.sh       # 구조 마이그레이션 스크립트
    ├── create-new-environments.sh # 새 환경 생성 스크립트
    ├── deploy-new-environment.sh  # 새 환경 배포 스크립트
    └── verify-independence.sh     # 독립성 검증 스크립트
```

## 📋 문서 분류

### 1. 사용자 문서 (docs/)
- **목적**: 최종 사용자를 위한 가이드
- **대상**: 교사, 학생, 관리자
- **내용**: 사용법, 기능 설명, 문제 해결

### 2. 개발자 문서 (project/)
- **목적**: 개발 및 유지보수를 위한 문서
- **대상**: 개발자, 시스템 관리자
- **내용**: 기술 사양, 변경 이력, 프로젝트 관리

### 3. 자동화 스크립트 (scripts/)
- **목적**: 반복 작업 자동화
- **대상**: 개발자, 시스템 관리자
- **내용**: 배포, 백업, 테스트 자동화

## 🔄 문서 업데이트 규칙

### 1. 변경사항 발생 시
- 즉시 관련 문서 업데이트
- 변경 이력 기록 (CHANGELOG.md)
- 영향받는 문서들 동기화

### 2. 새 기능 추가 시
- 사용자 가이드 작성
- API 문서 업데이트
- 테스트 가이드 추가

### 3. 문제 해결 시
- 문제 해결 과정 문서화
- 해결 방법 가이드 작성
- 향후 예방 방안 제시

## 📚 문서 접근 방법

### 사용자
1. `docs/README.md`에서 시작
2. 필요한 가이드 선택
3. 단계별 따라하기

### 개발자
1. `project/README.md`에서 시작
2. `project/CHANGELOG.md`로 변경사항 확인
3. 관련 기술 문서 참조

### 관리자
1. `scripts/` 폴더의 자동화 스크립트 활용
2. `project/` 폴더의 관리 문서 참조
3. `docs/deployment/` 배포 가이드 확인

## 🎯 문서 품질 기준

### 1. 명확성
- 명확한 제목과 목차
- 단계별 설명
- 예제와 스크린샷 포함

### 2. 최신성
- 변경사항 즉시 반영
- 버전 정보 명시
- 사용 가능한 기능만 문서화

### 3. 완전성
- 모든 기능에 대한 문서
- 문제 해결 방법 포함
- 관련 문서 링크 제공

## 🔍 문서 검색 팁

### 키워드 검색
- 기능명: "교사키", "업로드", "다운로드"
- 문제: "오류", "실패", "문제"
- 환경: "배포", "테스트", "개발"

### 문서 유형별 접근
- 사용법: `docs/` 폴더
- 기술 정보: `project/` 폴더
- 자동화: `scripts/` 폴더

## 📞 문서 개선 제안

문서에 문제가 있거나 개선이 필요하다면:
1. 이슈 등록
2. 개선 제안
3. 직접 수정 후 PR

---

**마지막 업데이트**: 2025-10-02  
**문서 버전**: 1.3.0
