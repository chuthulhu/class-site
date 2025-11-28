# API 문서

## 🚀 서버리스 함수 API

### submit.js / submit_test.js

#### 기능
파일 업로드 및 ZIP 생성, OneDrive 연동

#### 엔드포인트
- Production: `/.netlify/functions/submit`
- Testing: `/.netlify/functions/submit_test`

#### 요청 형식
```javascript
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
// ... 추가 파일들

const response = await fetch('/.netlify/functions/submit', {
    method: 'POST',
    body: formData
});
```

#### 응답 형식
```javascript
{
    "success": true,
    "message": "파일이 성공적으로 업로드되었습니다.",
    "data": {
        "zipUrl": "https://onedrive.live.com/...",
        "fileCount": 5,
        "totalSize": "2.5MB"
    }
}
```

### download.js / download_test.js

#### 기능
ZIP 파일 다운로드

#### 엔드포인트
- Production: `/.netlify/functions/download`
- Testing: `/.netlify/functions/download_test`

#### 요청 형식
```javascript
const response = await fetch('/.netlify/functions/download', {
    method: 'GET'
});
```

#### 응답 형식
```javascript
{
    "success": true,
    "message": "다운로드 준비 완료",
    "data": {
        "downloadUrl": "https://onedrive.live.com/...",
        "fileName": "experiment_files.zip"
    }
}
```

### gate-session2.js

#### 기능
세션2 접근 제어

#### 엔드포인트
- `/science-experiments/suhaeng3/session2`
- `/science-experiments/suhaeng3/session2.html`

#### 요청 형식
```javascript
const response = await fetch('/science-experiments/suhaeng3/session2', {
    method: 'GET'
});
```

## 🔧 환경변수

### 필수 환경변수
- `MICROSOFT_CLIENT_ID`: Microsoft Graph API 클라이언트 ID
- `MICROSOFT_CLIENT_SECRET`: Microsoft Graph API 클라이언트 시크릿
- `MICROSOFT_REFRESH_TOKEN`: Microsoft Graph API 리프레시 토큰

### 선택적 환경변수
- `MAX_FILE_SIZE`: 최대 파일 크기 (기본값: 50MB)
- `ALLOWED_EXTENSIONS`: 허용된 파일 확장자 (기본값: 모든 확장자)

## 📊 오류 코드

### 일반 오류
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `500`: 서버 오류

### 특정 오류
- `FILE_TOO_LARGE`: 파일 크기 초과
- `INVALID_FILE_TYPE`: 지원하지 않는 파일 형식
- `UPLOAD_FAILED`: 업로드 실패
- `ONEDRIVE_ERROR`: OneDrive 연동 오류

## 🔍 디버깅

### 로그 확인
```javascript
console.log('API 호출 시작:', endpoint);
console.log('요청 데이터:', requestData);
console.log('응답 데이터:', responseData);
```

### 오류 처리
```javascript
try {
    const response = await fetch(endpoint, options);
    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.message);
    }
    
    return data;
} catch (error) {
    console.error('API 오류:', error);
    throw error;
}
```

## 📈 성능 최적화

### 청크 업로드
대용량 파일의 경우 자동으로 청크 단위로 업로드됩니다.

### 캐싱
정적 파일은 브라우저 캐싱을 활용합니다.

### 압축
ZIP 파일은 자동으로 압축되어 전송됩니다.
