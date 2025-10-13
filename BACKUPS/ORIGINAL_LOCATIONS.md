# 원래 위치 태깅 정보

이 파일들은 다음 위치에서 이동되었습니다:

## 이동된 폴더들

### 1. archives/ 
- **원래 위치**: 루트의 `archives/` 폴더
- **이동 날짜**: 2025-10-13
- **내용**: 백업 파일들, node_modules 포함
- **용량**: 약 105MB

### 2. temps/
- **원래 위치**: 루트의 `temps/` 폴더  
- **이동 날짜**: 2025-10-13
- **내용**: 임시 HTML 파일들, 물리학II 수행평가 자료
- **용량**: 약 384KB

### 3. production/
- **원래 위치**: 루트의 `production/` 폴더
- **이동 날짜**: 2025-10-13
- **내용**: 프로덕션 환경 복사본 (class-site와 중복)
- **용량**: 약 553KB

### 4. testing/
- **원래 위치**: 루트의 `testing/` 폴더
- **이동 날짜**: 2025-10-13
- **내용**: 테스트 환경 복사본 (class-site와 중복)
- **용량**: 약 435KB

### 5. project/
- **원래 위치**: 루트의 `project/` 폴더
- **이동 날짜**: 2025-10-13
- **내용**: 프로젝트 문서들 (중복된 문서들)
- **용량**: 약 82KB

## 이동된 중복 파일들

### 6. netlify_root/
- **원래 위치**: 루트의 `netlify/` 폴더
- **이동 날짜**: 2025-10-13
- **내용**: class-site/netlify와 중복된 서버 함수들
- **용량**: 약 46KB

### 7. package-lock.json_root
- **원래 위치**: 루트의 `package-lock.json` 파일
- **이동 날짜**: 2025-10-13
- **내용**: class-site/package-lock.json과 중복
- **용량**: 약 21KB

## 복원 방법

필요시 다음 명령어로 원래 위치로 복원할 수 있습니다:

```bash
# 전체 복원
robocopy BACKUPS\archives archives /E
robocopy BACKUPS\temps temps /E
robocopy BACKUPS\production production /E
robocopy BACKUPS\testing testing /E
robocopy BACKUPS\project project /E
robocopy BACKUPS\duplicate_files\netlify_root netlify /E
Move-Item BACKUPS\duplicate_files\package-lock.json_root package-lock.json

# 개별 복원
robocopy BACKUPS\archives archives /E
```

## 주의사항

- 이 파일들을 삭제해도 `class-site/` 웹앱의 기능에는 전혀 영향을 주지 않습니다.
- 복원 후에는 다시 정리가 필요할 수 있습니다.
- 총 절약된 용량: 약 106MB
