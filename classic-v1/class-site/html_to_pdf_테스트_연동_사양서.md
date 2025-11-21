# HTML 기존 페이지 PDF 변환 테스트 연동 사양서

## 0. 요약 (Summary)

- **목적**: 기존에 서비스 중인 HTML 페이지 중 1개를 선택하여, “버튼 1번 클릭 → 서버에서 HTML을 PDF로 변환 → 브라우저에서 바로 다운로드” 기능을 **테스트용으로** 붙인다.
- **범위**:
  - 백엔드: 이미 구축한 Node.js/Express/Puppeteer 기반 PDF 서버 (`/pdf` 엔드포인트) 사용
  - 프론트엔드: 기존 HTML 문서에 버튼 + JavaScript Fetch 연동만 추가
- **우선 목표**:
  1. 별도의 설치 없이 **현재 브라우저(개발 중인 환경)**에서 버튼을 눌렀을 때 PDF가 다운로드 되는지 확인
  2. 한글 텍스트가 정상적으로 출력되는지 눈으로 검증

---

## 1. 시스템 구성 개요

### 1.1. 백엔드 (이미 구축됨)

- **환경**: AWS Ubuntu 서버 (`Node.js + Express + Puppeteer`)
- **서버 주소 (예시)**:
  - `SERVER_BASE_URL = http://3.34.186.110:3000`  
  - 실제 값은 현재 구동 중인 서버의 퍼블릭 IP/도메인 사용
- **PDF 변환 API**:

  - **Endpoint**: `POST /pdf`
  - **Request Body (JSON)**:
    ```json
    {
      "html": "<html> ... 전체 혹은 일부 HTML ... </html>"
    }
    ```
  - **Response**:
    - `Content-Type: application/pdf`
    - `Content-Disposition: attachment; filename="report.pdf"`
    - Body: PDF 바이너리 (다운로드용)

- **서버 내부 동작**:
  1. 클라이언트가 넘긴 HTML 문자열을 Puppeteer로 렌더링
  2. A4, `printBackground: true` 옵션으로 PDF 생성
  3. 생성된 PDF를 HTTP 응답으로 바로 전송

### 1.2. 프론트엔드 (기존 HTML 페이지)

- **전제**:
  - HTML 파일 또는 템플릿이 이미 존재함 (예: 과제 설명 페이지, 보고서 작성 페이지 등)
  - 해당 페이지에 JavaScript를 삽입할 수 있음
- **추가할 것**:
  - PDF 다운로드 버튼 1개
  - 버튼 클릭 시 `/pdf` API를 호출하는 JS 코드

---

## 2. 클라이언트 연동 설계

### 2.1. 테스트 대상 페이지

- **테스트용으로 사용할 기존 페이지**:
  - 예: `/test/report.html`, `/student/report.html`, 또는 로컬 HTML 파일
  - 페이지 내에 학생/사용자가 작성한 내용이 포함되어 있으면 더 좋음 (실제 케이스에 가까움)

### 2.2. 어떤 HTML을 서버에 보낼 것인가?

- **1차 테스트 목표**: 플로우 검증이 우선이므로  
  → **페이지 전체 HTML(`document.documentElement.outerHTML`)을 보낸다.**
- 추후 확장:
  - 특정 컨테이너만 보내고 싶다면,  
    예: `<div id="report-root"> ... </div>` 같은 영역만 **선택적으로 전송**하도록 변경 예정.

---

## 3. 버튼 및 스크립트 추가 사양

### 3.1. HTML에 버튼 추가

테스트용 페이지의 적절한 위치(예: 상단/하단)에 버튼을 추가한다.

```html
<button id="btnPdfDownload">이 페이지를 PDF로 저장</button>
```

- `id="btnPdfDownload"`: JS에서 선택하기 위한 고유 ID

### 3.2. JavaScript 코드 추가

페이지 하단(</body> 직전) 또는 별도 JS 파일에 다음 스크립트를 추가한다.

```html
<script>
  (function () {
    const SERVER_BASE_URL = 'http://3.34.186.110:3000'; // 실제 서버 주소로 교체

    const btn = document.getElementById('btnPdfDownload');
    if (!btn) {
      console.warn('[PDF] 버튼(#btnPdfDownload)을 찾을 수 없습니다.');
      return;
    }

    btn.addEventListener('click', async () => {
      try {
        // 1) 서버로 보낼 HTML 추출
        // 전체 페이지를 보낼 경우:
        const html = document.documentElement.outerHTML;

        // TODO: 특정 영역만 보낼 경우 (향후 확장)
        // const target = document.getElementById('report-root');
        // const html = target ? target.outerHTML : document.documentElement.outerHTML;

        // 2) 서버에 PDF 생성 요청
        const response = await fetch(SERVER_BASE_URL + '/pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ html }),
        });

        if (!response.ok) {
          alert('PDF 생성에 실패했습니다. (서버 오류)');
          console.error('[PDF] Server response:', response.status, response.statusText);
          return;
        }

        // 3) 응답(PDF)을 blob으로 받아서 강제 다운로드 트리거
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'report.pdf'; // 다운로드 파일명 (필요시 변경)
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('[PDF] 요청 중 오류:', err);
        alert('PDF 생성 요청 중 네트워크 오류가 발생했습니다.');
      }
    });
  })();
</script>
```

#### 주의 사항

- `SERVER_BASE_URL`를 실제 서버 주소로 교체해야 한다.  
  예: `http://3.34.186.110:3000`
- 첫 클릭 시 동작:
  1. 현재 페이지 전체 HTML을 문자열로 추출
  2. `/pdf`로 POST 요청
  3. 응답(PDF)을 blob으로 받아 `<a>` 태그를 통해 자동 다운로드

---

## 4. 테스트 절차

1. 서버에서 `server.js` 실행

```bash
cd ~/pdf-server
node server.js
```

- 콘솔에 `Server running on port 3000` 문구가 떠 있어야 한다.

2. 로컬 브라우저(PC)에서 테스트 HTML 페이지를 연다.
3. `이 페이지를 PDF로 저장` 버튼을 클릭한다.
4. 기대 결과:
   - 브라우저가 `report.pdf` 파일 다운로드를 시작한다.
   - 다운로드된 PDF를 열어보면:
     - 현재 페이지 내용이 A4 PDF로 렌더링되어 있고
     - 한글 텍스트가 정상적으로 출력된다.

이 문서는 **기존 HTML 페이지 중 하나에 PDF 테스트 기능을 붙일 때** AI 에이전트와 사람이 공유할 사양서로 사용한다.