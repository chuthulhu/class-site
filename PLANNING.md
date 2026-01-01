# 1. 기획 단계 (설계 및 문서화)

이 문서는 기존 `class-site` 프로젝트의 코드를 역분석하여 바이브 코딩 가이드의 '1. 기획 단계' 형식으로 정리한 문서입니다.

## 1.1. 기능 정의 (Feature Definition)

### **A. 교사 관리 포털 (Teacher Portal)**

* **관리자 인증:** 로컬(폴백 암호) 및 프로덕션(Cloudflare Functions API) 환경을 구분하여 관리자 로그인을 처리합니다.
* **대시보드:** 과목별(물리학II, 과학탐구실험) 활동 현황을 카드 형태로 시각화하여 제공합니다.
* **활동 관리:** 활동 미리보기 및 편집(기능 준비 중) 진입점을 제공합니다.

### **B. 학생 수행평가 활동 (Student Activities)**

* **스마트 기기 생물 조사 (`suhaeng4`):**
  * **탭 기반 UI:** 활동 안내, 계획서, 보고서, 카드 제작 탭 전환 기능.
  * **데이터 입력 및 관리:** 학생 정보 및 활동 내용의 임시 저장/불러오기(Local Storage/JSON 파일).
  * **PDF/ZIP 생성:** `jspdf`, `jszip` 등을 활용(또는 자체 구현)하여 클라이언트 사이드에서 보고서를 생성하고 서버로 제출하거나 다운로드합니다.
* **연구 윤리 탐구 (`suhaeng1`):**
  * **인터랙티브 웹 문서:** 스크롤 애니메이션 및 탭을 활용한 학습 콘텐츠 제공.

---

## 1.2. 개발 환경 명세 (Environment Spec)

* **언어:** HTML5, JavaScript (ES6+), CSS3
* **스타일링:** Tailwind CSS (CDN 방식, `v3.x`)
* **프레임워크:** 없음 (Vanilla JS 기반)
* **라이브러리:**
  * `jspdf` (PDF 생성, `suhaeng4` 내장)
  * `jszip` (ZIP 생성, `modules/zip.js`)
* **배포 환경:**
  * **Local:** `local-dev-config.js`를 이용한 모의 인증 지원.
  * **Production:** Cloudflare Pages (정적 호스팅 + Functions).

---

## 1.3. 구조 설계 (Structural Design)

### **1.3.1. 전체 디렉토리 구조**

```text
class-site/
├── class-site/
│   ├── index.html              # [Portal] 메인 진입점 (교사 대시보드)
│   └── science-experiments/
│       ├── modules/            # [Framework] 공용 모듈 (Hub 시스템)
│       │   ├── hub-app.js      # App 진입점 (initHub)
│       │   ├── hub-storage.js  # 데이터 저장소 관리
│       │   ├── hub-submit.js   # 제출 로직 (ZIP 생성 등)
│       │   └── ...
│       ├── suhaeng1/           # [Activity] 연구 윤리 (정적 페이지)
│       └── suhaeng4/           # [Activity] 생물 조사 (독립형 모놀리식 구조)
```

### **1.3.2. 논리적 흐름 (Caller-Callee Tree)**

#### **A. Hub Framework (공용 모듈 기반)**

새로운 활동(예: `suhaeng3`)은 이 구조를 따릅니다.

* **`Activity Page (index.html)`**
  * `import { initHub } from '../modules/hub-app.js'`
  * **`initHub()`** (in `hub-app.js`)
    * -> `initHubGate()` (시간 제한/비밀번호 잠금 확인)
    * -> `loadAll()` (저장된 데이터 복원)
    * -> `bindAutosave()` (입력 변경 감지 및 저장)
    * -> `bindSubmitFlow()` (제출 버튼 이벤트 연결)
      * -> **(User Click Submit)**
      * -> `validateStudentMeta()` (학생 정보 검증)
      * -> `buildZipAndSubmit()` (in `hub-submit.js`)
        * -> `generateDocHtml()` (보고서 HTML 생성)
        * -> **(ZIP Generation)**

#### **B. Standalone Activity (`suhaeng4`)**

기존에 개발된 `suhaeng4`는 독자적인 내부 구조를 가집니다.

* **`suhaeng4/index.html`** (Script Block)
  * **Event Listeners** (`DOMContentLoaded`)
    * -> `initTabs()` (탭 UI 초기화)
    * -> `loadData()` (로컬 스토리지 데이터 로드)
  * **User Action: PDF/ZIP Download**
    * -> `handleSubmit()` (제출 버튼 핸들러)
    * -> `checkInputs()` (유효성 검사)
    * -> `generatePDF()` (내부 로직)
      * -> `html2canvas` / `jspdf` (가정)
    * -> `downloadFile()`

---

## 2. 워크플로우 (이후 계획)

1. **리팩토링 검토:** `suhaeng4`의 독립적인 로직을 `modules` 기반의 **Hub Framework**로 마이그레이션 할지 결정.
2. **문서화:** 각 주요 모듈(`hub-storage`, `hub-submit`)의 상세 API 명세 작성.
3. **테스트:** 로컬 환경(`local-dev-config.js`)에서 인증 및 제출 시뮬레이션 수행.
