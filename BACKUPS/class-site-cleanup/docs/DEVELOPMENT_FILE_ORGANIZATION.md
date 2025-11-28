# 개발용 파일 정리 가이드

## 📁 디렉토리 구조

### 🚀 **프로덕션 배포 파일** (Netlify에 배포됨)
```
class-site/
├── index.html                    # 메인 포털 페이지
├── physics2/                     # 물리학II 활동지
├── science-experiments/          # 과학탐구실험 활동지
└── netlify/functions/            # 서버 함수들
```

### 🛠️ **개발용 파일** (GitHub에 커밋, Netlify 배포 제외)
```
class-site/
├── local-dev-config.example.js   # 로컬 설정 템플릿
├── env.example                   # 환경변수 템플릿
├── environment.txt               # 환경변수 가이드
└── docs/                         # 개발 문서
```

### 🧪 **테스트 파일** (GitHub에 커밋, Netlify 배포 제외)
```
testing-framework/                # Playwright 테스트 프레임워크
docs/                            # 프로젝트 문서
scripts/                         # 배포/백업 스크립트
config/                          # 설정 파일들
```

## 🔧 **Netlify 배포 설정**

`netlify.toml`에서 다음 파일들이 배포에서 제외됩니다:

- `BACKUPS/` - 백업 파일들
- `testing-framework/` - 테스트 프레임워크
- `docs/` - 프로젝트 문서
- `scripts/` - 배포 스크립트
- `config/` - 설정 파일들
- `class-site/docs/` - 개발 문서
- `class-site/local-dev-config.js` - 로컬 설정 (보안)
- `class-site/env.example` - 환경변수 템플릿
- `class-site/environment.txt` - 환경변수 가이드
- `class-site/local-dev-config.example.js` - 로컬 설정 템플릿
- `class-site/node_modules/` - 의존성 패키지
- `class-site/package.json` - 패키지 설정
- `class-site/package-lock.json` - 패키지 락 파일
- `class-site/ROLLBACK_GUIDE.md` - 롤백 가이드

## 📝 **사용법**

### **로컬 개발시**
1. `local-dev-config.example.js`를 `local-dev-config.js`로 복사
2. 필요한 설정 수정
3. 로컬 서버로 테스트

### **프로덕션 배포시**
- Netlify가 자동으로 필요한 파일만 배포
- 개발용 파일들은 자동으로 제외됨
- 환경변수는 Netlify 대시보드에서 관리

## ⚠️ **주의사항**

- `local-dev-config.js`는 절대 Git에 커밋하지 마세요
- 개발용 파일들은 GitHub에는 커밋되지만 Netlify에는 배포되지 않습니다
- 프로덕션 환경에서는 Netlify Functions와 환경변수를 사용합니다
