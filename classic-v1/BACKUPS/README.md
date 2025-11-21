# BACKUPS 폴더

이 폴더는 프로젝트에서 불필요한 파일들을 정리하여 보관하는 곳입니다.

## 폴더 구조

- `archives/` - 원래 위치: 루트의 `archives/` 폴더
- `temps/` - 원래 위치: 루트의 `temps/` 폴더  
- `production/` - 원래 위치: 루트의 `production/` 폴더
- `testing/` - 원래 위치: 루트의 `testing/` 폴더
- `project/` - 원래 위치: 루트의 `project/` 폴더
- `duplicate_files/` - 중복된 설정 파일들

## 이동 이유

이 파일들은 `class-site/` 웹앱의 기능에 영향을 주지 않는 불필요한 파일들입니다:

1. **중복된 환경 폴더들** - `class-site/`와 거의 동일한 내용
2. **백업 및 임시 파일들** - 용량만 차지하는 파일들
3. **중복된 설정 파일들** - 실제 사용되지 않는 파일들
4. **프로젝트 문서들** - 중복된 문서들

## 복원 방법

필요시 다음 명령어로 원래 위치로 복원할 수 있습니다:

```bash
# 전체 복원
mv BACKUPS/archives ./
mv BACKUPS/temps ./
mv BACKUPS/production ./
mv BACKUPS/testing ./
mv BACKUPS/project ./

# 개별 복원
mv BACKUPS/archives ./
```

## 주의사항

- 이 파일들을 삭제해도 `class-site/` 웹앱의 기능에는 전혀 영향을 주지 않습니다.
- 복원 후에는 다시 정리가 필요할 수 있습니다.
