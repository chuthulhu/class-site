# Netlify 환경변수 설정 가이드

## 교사 관리 포털 암호 설정

### 1. Netlify 대시보드에서 환경변수 설정

1. **Netlify 대시보드 접속**
   - https://app.netlify.com 접속
   - 해당 사이트 선택

2. **환경변수 설정**
   - 좌측 메뉴에서 "Site settings" 클릭
   - "Environment variables" 섹션으로 이동
   - "Add variable" 버튼 클릭

3. **변수 추가**
   ```
   Key: ADMIN_PASSWORD
   Value: 원하는_암호_입력 (예: teacher2024)
   ```

### 2. 로컬 개발 환경 설정

#### 방법 1: 로컬 개발 설정 파일 사용 (권장)
1. **템플릿 파일 복사**:
   ```bash
   # class-site/ 디렉토리에서 실행
   cp local-dev-config.example.js local-dev-config.js
   ```

2. **설정 파일 편집**:
   `local-dev-config.js` 파일에서 암호 변경:
   ```javascript
   window.LOCAL_DEV_CONFIG = {
       ADMIN_PASSWORD: 'your_password_here',
       ENABLE_LOCAL_AUTH: true,
       DEBUG_MODE: true
   };
   ```

3. **참고 파일**:
   - `local-dev-config.example.js`: 설정 파일 템플릿
   - `env.example`: 환경변수 템플릿
   - `environment.txt`: 상세 설정 가이드

#### 방법 2: .env 파일 사용 (Netlify CLI 사용시)
1. **템플릿 파일 복사**:
   ```bash
   # 프로젝트 루트에서 실행
   cp env.example .env
   ```

2. **직접 생성**:
   프로젝트 루트(`class-site/`)에 `.env` 파일 생성:
   ```
   ADMIN_PASSWORD=teacher2024
   NODE_ENV=development
   ```

#### 방법 2: netlify.toml에 설정 (이미 설정됨)
`netlify.toml` 파일에 이미 설정되어 있습니다:
```toml
[build.environment]
  ADMIN_PASSWORD = "teacher2024"
```

#### 방법 3: 시스템 환경변수 설정
```bash
# Windows (PowerShell)
$env:ADMIN_PASSWORD="teacher2024"

# Windows (CMD)
set ADMIN_PASSWORD=teacher2024

# macOS/Linux
export ADMIN_PASSWORD=teacher2024
```

### 3. 보안 권장사항

- **강력한 암호 사용**: 최소 8자 이상, 특수문자 포함
- **정기적 변경**: 보안을 위해 주기적으로 암호 변경
- **환경별 분리**: 개발/스테이징/프로덕션 환경별로 다른 암호 사용

### 4. 암호 변경 시 주의사항

1. Netlify 대시보드에서 환경변수 수정
2. 사이트 재배포 (자동으로 재배포됨)
3. 새로운 암호로 로그인 테스트

### 5. 문제 해결

#### 로그인 실패 시
- 환경변수가 올바르게 설정되었는지 확인
- 사이트가 재배포되었는지 확인
- 브라우저 개발자 도구에서 네트워크 탭 확인

#### API 오류 시
- Netlify Functions 로그 확인
- 환경변수 이름이 정확한지 확인 (`ADMIN_PASSWORD`)

### 6. 기본값

환경변수가 설정되지 않은 경우 기본값 `teacher2024`가 사용됩니다.
실제 운영 환경에서는 반드시 환경변수를 설정하세요.
