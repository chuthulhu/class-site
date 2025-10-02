# .gitignore 가이드

프로젝트의 .gitignore 파일 설정과 관리 방법을 설명합니다.

## 📋 개요

.gitignore 파일은 Git이 추적하지 않을 파일과 디렉토리를 지정하는 설정 파일입니다. 이 프로젝트에서는 다양한 환경과 도구를 고려하여 포괄적인 무시 규칙을 설정했습니다.

## 🔧 주요 무시 규칙

### 1. 의존성 파일
```gitignore
# Dependencies
node_modules/
*/node_modules/
**/node_modules/
```
- 모든 레벨의 node_modules 디렉토리 무시
- 프로젝트 구조 변경에 대응

### 2. 빌드 출력물
```gitignore
# Build outputs
dist/
build/
*/dist/
*/build/
**/dist/
**/build/
```
- 빌드 결과물 자동 무시
- 환경별 빌드 디렉토리 포함

### 3. 캐시 디렉토리
```gitignore
# Cache directories
.cache/
*/cache/
**/cache/
.eslintcache
.parcel-cache/
.vite/
.netlify/
```
- 다양한 도구의 캐시 파일 무시
- 성능 최적화를 위한 캐시 관리

### 4. 환경 변수 파일
```gitignore
# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.env
```
- 민감한 정보가 포함된 환경 변수 파일 보호
- 환경별 설정 파일 무시

### 5. 프로젝트 특화 규칙
```gitignore
# Project specific
class-submission-*.json
key.b64.txt
*.backup
*.phase1
*.phase2

# Netlify specific
.netlify/
netlify.toml.backup

# Project environment files
production/.env*
testing/.env*
class-site/.env*
```

## 🎯 프로젝트별 무시 규칙

### 백업 파일
- `*.backup`: 백업 파일 자동 무시
- `*.phase1`, `*.phase2`: 개발 단계별 백업 파일
- `netlify.toml.backup`: Netlify 설정 백업

### 환경별 설정
- `production/.env*`: 프로덕션 환경 변수
- `testing/.env*`: 테스트 환경 변수
- `class-site/.env*`: 메인 애플리케이션 환경 변수

### 임시 파일
- `temps/*.tmp`: 임시 파일
- `temps/*.temp`: 임시 파일

## 🔍 무시 규칙 확인 방법

### 현재 무시되는 파일 확인
```bash
git ls-files --others --ignored --exclude-standard
```

### 특정 파일이 무시되는지 확인
```bash
git check-ignore <파일명>
```

### 무시 규칙 테스트
```bash
git status --ignored
```

## ⚠️ 주의사항

### 1. 이미 추적 중인 파일
이미 Git에 추가된 파일은 .gitignore에 추가해도 무시되지 않습니다.

```bash
# 추적 중인 파일을 제거하려면
git rm --cached <파일명>
git commit -m "Remove tracked file"
```

### 2. 환경 변수 보안
- `.env` 파일은 절대 커밋하지 마세요
- 민감한 정보는 환경 변수로 관리
- 예시 파일(`.env.example`)만 커밋

### 3. 백업 파일 관리
- 백업 파일은 자동으로 무시됨
- 중요한 백업은 별도 저장소에 보관
- 백업 파일명 규칙 준수

## 🛠️ .gitignore 관리

### 새 규칙 추가
1. .gitignore 파일 편집
2. 적절한 섹션에 규칙 추가
3. 주석으로 규칙 설명 추가
4. 테스트 후 커밋

### 규칙 테스트
```bash
# 새 파일 생성하여 테스트
touch test-file.tmp
git status  # 무시되는지 확인
rm test-file.tmp
```

### 규칙 검증
```bash
# 무시 규칙이 올바른지 확인
git check-ignore -v <파일명>
```

## 📚 관련 문서

- [Git 공식 문서](https://git-scm.com/docs/gitignore)
- [환경 변수 관리](project/configuration.md)
- [배포 가이드](project/deployment.md)
- [보안 가이드](project/README.md#보안)

## 🔄 업데이트 이력

### v1.3.0 (2025-10-02)
- 프로젝트 구조에 맞는 무시 규칙 추가
- 환경별 설정 파일 무시 규칙 강화
- 백업 파일 관리 규칙 개선

### v1.2.0 (2025-08-30)
- 기본 무시 규칙 설정
- Node.js 프로젝트 표준 규칙 적용

---

**마지막 업데이트**: 2025-10-02  
**관리자**: 프로젝트 팀  
**문서 버전**: 1.3.0
