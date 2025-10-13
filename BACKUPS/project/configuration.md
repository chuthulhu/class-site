# 환경 변수 설정

Netlify 환경에서 다음 환경 변수를 설정하세요. 모든 값은 Netlify 사이트 설정 → Environment variables에 추가합니다.

- SUBMIT_KEY: 제출 인증 키. 클라이언트가 헤더 X-Submission-Key로 전송해야 합니다.
- MS_TENANT_ID: Microsoft Entra(AD) 테넌트 ID.
- MS_CLIENT_ID: Microsoft 앱(클라이언트) ID.
- MS_CLIENT_SECRET: Microsoft 앱 시크릿.
- MS_REFRESH_TOKEN: 교사 계정의 OAuth Refresh Token (Delegated 권한).
- ROOT_FOLDER_PATH: 업로드 루트 폴더 경로. 예) /과제제출

권한 범위(Delegated): offline_access, Files.ReadWrite, openid, profile, User.Read

참고: 보안상 민감정보는 저장소에 커밋하지 않습니다. Netlify UI에만 설정하세요.
