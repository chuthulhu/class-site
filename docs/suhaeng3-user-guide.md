# suhaeng3 개요

과학탐구실험2 수행평가(수행3) 웹 애플리케이션으로, 보고서를 ZIP으로 생성하고 업로드 먼저 수행한 뒤 기기/브라우저 환경에 맞춰 다운로드를 안내합니다.

핵심 포인트
- 미리보기/새 탭/ZIP 문서가 동일 템플릿(generateDocHtml)로 생성되어 일관된 스타일 제공
- 업로드 우선: OneDrive 업로드 성공 후 다운로드 경로 제공
- 인앱 브라우저(Naver/Kakao 등): 서버 첨부 응답 다운로드로 호환성 확보
- iOS Safari: 공유 시트 기반 "파일에 저장" 안내 모달 제공
- iOS 또는 인앱 환경에서는 PDF 인쇄 버튼 숨김
- KST(Asia/Seoul) 타임스탬프 기반 파일명 생성
- 클라이언트 ZIP 크기 제한: 8MB (인앱 첨부 응답/성능 고려)
- 업로드 경로: `/과제제출/{subject}/{activity}/{section}/{studentId}/...` (activity는 메타 `submission-activity` 우선, 없으면 입력값. 현재 웹앱은 입력 UI 제거로 메타만 사용)

관련 문서
- 사용자 가이드: ./user-guide.md
- 테스트 가이드: ./test-guide.md
- API/배포/환경변수: ../api.md, ../deployment.md, ../configuration.md
