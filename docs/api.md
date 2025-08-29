# API 레퍼런스

## POST /.netlify/functions/submit

학생 파일 제출을 위한 메인 엔드포인트입니다.

요청(JSON)
{
  "studentId": "10207",
  "subject": "과학탐구실험2",
  "section": "102",
  "files": [
    { "filename": "report.zip", "contentBase64": "<base64>", "mime": "application/zip" }
  ]
}

응답(JSON)
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

설명
- 10MB 이하는 단일 PUT, 그 이상은 업로드 세션(청크)로 전송됩니다.
- 검증 실패 시 4xx, 서버 오류 시 5xx와 함께 { ok:false, error, detail? } 형식을 반환합니다.

## POST /.netlify/functions/download

인앱 브라우저에서의 파일 다운로드를 위해 서버가 첨부 응답으로 내려주는 엔드포인트입니다.

요청(JSON 또는 x-www-form-urlencoded)
{
  "filename": "report.zip",
  "mime": "application/zip",
  "contentBase64": "<base64>"
}

응답
- 200 OK + Content-Disposition: attachment; filename="..."; filename*=UTF-8''...
- 현재 사이즈 제한: 8MB (초과 시 413)
