# API 레퍼런스

## POST /.netlify/functions/submit

학생 파일 제출을 위한 메인 엔드포인트입니다.

요청(JSON)
```json
{
  "studentId": "10207",
  "subject": "과학탐구실험2",
  "section": "102",
  "files": [
    { "filename": "report.zip", "contentBase64": "<base64>", "mime": "application/zip" }
  ]
}
```

응답(JSON)
```json
{
  "ok": true,
  "studentId": "10207",
  "subject": "과학탐구실험2",
  "section": "102",
  "submittedAt": "2025-08-30T01:23:45.000Z",
  "files": [
    { "name": "report.zip", "size": 123456, "webUrl": "https://...", "chunked": false }
  ]
}
```

설명
- 10MB 이하는 단일 PUT, 그 이상은 업로드 세션(청크, 8MiB)로 전송됩니다.
- 검증 실패 시 4xx, 서버 오류 시 5xx와 함께 `{ ok:false, error, detail? }` 형식을 반환합니다.

인증
- 헤더: `X-Submission-Key: <SUBMIT_KEY>` (누락/불일치 시 401)

검증 규칙(서버)
- 허용 확장자: pdf, html, htm, jpg, jpeg, png, csv, txt, zip, hwp, hwpx, ppt, pptx, xlsx, mp4
- 형식별 최대 용량(MB): pdf 20, html/htm 5, jpg/jpeg/png 8, csv/txt 2, zip 50, hwp/hwpx 10, ppt/pptx 40, xlsx 5, mp4 300
- 제출 제한: 파일 최대 5개, 총합 300MB
- 간이 콘텐츠 스니핑: pdf/jpg/png/zip(pptx/xlsx/hwpx 포함)/mp4 등 일부 형식만 확인(불일치 시 415)

특기사항(suhaeng3)
- 클라이언트 ZIP 생성물은 8MB 초과 시 업로드 전 단계에서 차단됩니다(인앱 다운로드 호환/성능 고려).

에러 예시
```json
{ "ok": false, "error": "unsupported file type", "detail": "foo.exe" }
{ "ok": false, "error": "file too large", "detail": "zip max 50MB" }
{ "ok": false, "error": "content mismatch", "detail": "report.zip (zip)" }
{ "ok": false, "error": "unauthorized" }
```

## POST /.netlify/functions/download

인앱 브라우저에서의 파일 다운로드를 위해 서버가 첨부 응답으로 내려주는 엔드포인트입니다.

요청(JSON 또는 x-www-form-urlencoded)
```json
{
  "filename": "report.zip",
  "mime": "application/zip",
  "contentBase64": "<base64>"
}
```

응답
- 200 OK + Content-Disposition: attachment; filename="..."; filename*=UTF-8''...
- 사이즈 제한: 8MB 초과 시 413(Payload too large)

용도
- 인앱 브라우저(Naver/Kakao 등)에서 a[download]/Blob이 제한될 때 서버가 첨부 응답으로 직접 내려 사용자 저장을 보장합니다.
