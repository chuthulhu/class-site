# 교사 관리 포털 - 개발 가이드

## 🚀 **빠른 시작**

### **로컬 개발**
1. **설정 파일 생성**:
   ```bash
   cp local-dev-config.example.js local-dev-config.js
   ```

2. **로컬 서버 실행**:
   - Five Server, Live Server 등 사용
   - 암호: 설정 파일에서 확인

3. **테스트**:
   ```bash
   # Playwright 테스트 실행
   cd testing-framework
   npm test
   ```

### **프로덕션 배포**
- Netlify 자동 배포
- 환경변수는 Netlify 대시보드에서 관리

## 📁 **파일 구조**

### **프로덕션 파일** (배포됨)
- `index.html` - 메인 포털
- `physics2/` - 물리학II 활동지
- `science-experiments/` - 과학탐구실험
- `netlify/functions/` - 서버 함수

### **개발 파일** (GitHub 커밋, 배포 제외)
- `local-dev-config.example.js` - 로컬 설정 템플릿
- `env.example` - 환경변수 템플릿
- `environment.txt` - 환경변수 가이드
- `docs/` - 개발 문서

### **테스트 파일** (GitHub 커밋, 배포 제외)
- `testing-framework/` - Playwright 테스트
- `docs/` - 프로젝트 문서
- `scripts/` - 배포 스크립트

## 🔧 **환경 설정**

### **로컬 개발**
```javascript
// local-dev-config.js
window.LOCAL_DEV_CONFIG = {
    ADMIN_PASSWORD: 'your_password',
    ENABLE_LOCAL_AUTH: true,
    DEBUG_MODE: true
};
```

### **프로덕션**
- Netlify 환경변수: `ADMIN_PASSWORD`
- 서버 사이드 인증 사용

## 🧪 **테스트**

### **로컬 테스트**
- Five Server에서 로컬 인증 테스트
- 브라우저 개발자 도구에서 디버깅

### **자동화 테스트**
```bash
cd testing-framework
npm install
npm test
```

## 📚 **문서**

- `docs/DEVELOPMENT_FILE_ORGANIZATION.md` - 파일 구조 가이드
- `docs/ENVIRONMENT_SETUP_GUIDE.md` - 환경변수 설정
- `docs/TESTING_GUIDE.md` - 테스트 가이드

## ⚠️ **보안**

- `local-dev-config.js`는 Git에 커밋하지 마세요
- 프로덕션에서는 환경변수 사용
- 개발용 암호와 프로덕션 암호는 다르게 설정
