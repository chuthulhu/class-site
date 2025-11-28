🚀 오라클 서버 기반 과제 제출 시스템 마이그레이션 가이드

이 문서는 기존의 Netlify Serverless 기반 suhaeng3, suhaeng4 웹앱을 오라클 클라우드(VPS) 기반의 Node.js 서버 아키텍처로 전환하기 위한 지침서입니다.

1. 프로젝트 목표 (Goal)

"Client-Heavy"에서 "Server-Heavy" 구조로 전환하여 프론트엔드를 경량화하고 백엔드 처리 능력을 극대화한다.

기존 (Legacy): 브라우저에서 JSZip으로 압축하고 Base64로 변환하여 Netlify Function으로 전송.

변경 (New): 브라우저는 순수 HTML 문자열과 JSON 메타데이터만 전송. 서버가 PDF 변환 및 원드라이브 업로드를 전담.

2. 아키텍처 변경 사항 (Architecture Changes)

A. 프론트엔드 (HTML/JS)

제거:

jszip.min.js 라이브러리 의존성 제거.

blobToBase64, handleZipDownloadAndSubmit 등 복잡한 파일 처리 로직 제거.

모바일/PC 분기 처리 로직 단순화.

추가/변경:

submitReport() 함수: 사용자 입력값(학번, 이름 등)과 에디터의 HTML 내용을 JSON 객체로 포장하여 서버로 POST 요청.

하드코딩된 키: 사용자 편의를 위해 API_KEY를 프론트엔드 코드에 내장 (보안 타협).

이미지 처리 및 압축 (수행4 방식 + 개선):

Quill 에디터를 사용하여 이미지 캡처 및 붙여넣기(Ctrl+V) 지원.

[중요] 이미지 압축: browser-image-compression 등의 라이브러리를 사용하여, 이미지가 삽입될 때 자동으로 리사이징 및 압축(예: 최대 폭 1024px, 품질 0.7)을 수행하여 HTML 용량을 최소화.

압축된 이미지는 Base64 형태로 변환되어 HTML 문자열 내에 포함됨.

B. 백엔드 (Oracle Server - Node.js)

기술 스택: Express.js, Puppeteer-core (Chrome), Multer, MS Graph API.

주요 기능:

수신: JSON 데이터(학생 정보 + HTML 본문) 수신.

필수 설정: 이미지 포함 대용량 HTML 처리를 위해 express.json({ limit: '50mb' }) 및 express.urlencoded({ limit: '50mb' }) 설정 적용.

변환: Puppeteer를 사용하여 수신된 HTML을 A4 규격 PDF로 렌더링. (배경 제거 모드)

executablePath: '/usr/bin/chromium-browser' (오라클 ARM 경로) 사용.

분류: 과제제출/{과목}/{활동}/{반}/{학번}\_{이름} 형태의 폴더 구조 자동 생성.

저장: 생성된 PDF와 원본 HTML 파일을 MS OneDrive에 업로드.

중복 방지: 동일 파일명 존재 시 \_YYYYMMDD_HHMMSS 타임스탬프 자동 추가.

토큰 관리: tokens.json을 이용한 Refresh Token 영구 자동 갱신.

3. 상세 구현 가이드 (Implementation Steps)

Step 1: 서버 (Backend) 구축 (server.js)

환경: Oracle Cloud Infrastructure (ARM Ampere A1), Ubuntu 22.04.

필수 설정:

puppeteer.launch 시 executablePath: '/usr/bin/chromium-browser' 지정 (ARM 호환).

[중요] app.use(express.json({ limit: '50mb' })) 설정으로 이미지 포함된 HTML 수용.

Graph API:

Large File Upload (Upload Session) 대신 일반 PUT 업로드 사용 (PDF 용량이 크지 않으므로 단순화).

폴더가 없으면 자동 생성되는 Graph API 특성 활용.

Step 2: 프론트엔드 (index.html) 리팩토링

입력 폼: 학번, 이름 입력창 유지. 과목/과제명은 코드 상단 const 변수로 고정.

에디터 설정:

Quill 에디터 초기화 시 이미지 모듈 활성화.

이미지 핸들러 구현: 이미지가 첨부되면 압축 로직을 거친 후 에디터에 삽입되도록 커스텀 핸들러 작성.

전송 로직:

const payload = {
studentId: "20301",
studentName: "홍길동",
subject: "과학탐구실험2",
activity: "수행4\_생태조사", // 예시
htmlContent: quill.root.innerHTML // 압축된 이미지가 Base64로 포함된 전체 HTML
};

4. AI 에이전트 작업 지시 프롬프트 (Prompt for AI)

아래 프롬프트를 사용하여 코드를 생성하시오:

"현재 suhaeng3/index.html (또는 suhaeng4)의 복잡한 클라이언트 사이드 로직(ZIP 압축 등)을 모두 제거하고, 오라클 서버(https://pdf.physichu.kr/submit)로 HTML 문자열과 학생 정보를 JSON으로 전송하는 간결한 코드로 리팩토링해 줘.

[프론트엔드 요구사항]

Quill 에디터를 사용하여 이미지 붙여넣기가 가능해야 함.

[중요] 이미지를 붙여넣을 때 browser-image-compression 라이브러리 등을 사용하여 **적절히 압축(Resizing & Compression)**한 후 에디터에 삽입되도록 구현해 줘. (HTML 용량 최적화)

전송 시 이미지가 포함된 HTML 전체를 JSON의 htmlContent 필드에 담아 전송.

API_KEY는 코드 내에 하드코딩.

[백엔드 요구사항 (server.js)]

express 용량 제한을 50mb로 설정하여 대용량 HTML 수신 가능하게 할 것.

puppeteer-core를 사용하여 받은 HTML을 PDF로 변환 (오라클 ARM 크롬 경로 사용).

MS Graph API를 사용하여 과제제출/과목/활동/반/학번\_이름 폴더에 PDF와 HTML을 업로드.

파일 중복 시 KST 타임스탬프를 붙여서 저장.

tokens.json을 이용한 토큰 자동 갱신 기능 포함."

5. 참고 사항 (References)

서버 주소: https://pdf.physichu.kr (Cloudflare + Nginx + Node.js)

인증 키: .env 파일의 SUBMIT_KEY와 프론트엔드의 API_KEY가 일치해야 함.

이미지 처리: 학생이 붙여넣은 이미지는 Base64 형태로 HTML에 포함되어 전송됨 (서버 용량 제한 주의).
