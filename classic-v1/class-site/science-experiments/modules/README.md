# 공용 모듈 디렉터리 (science-experiments/modules)

`suhaeng3-test` 뿐 아니라 이후 `suhaeng3` 및 다른 실험 활동들이 재사용할 수 있는 ES Module 공용 스크립트 위치.

초기 구성:
- `dom.js` : 탭/DOM 유틸
- `gate.js`: 공개 시점 게이트 (교사용 key 포함)
- `preview.js`: 단순 미리보기 바인딩
- `storage.js`: 간단 자동 저장

점진적 추가 예정:
- `sources.js`, `submit.js`, `report.js`, `zip.js`, `env.js` 등

사용 예 (HTML):
```html
<script type="module">
  import { initTabs } from '../modules/dom.js';
  import { initGate } from '../modules/gate.js';
  initTabs();
  initGate({ unlockAt: '2025-10-12T15:00:00Z' });
</script>
```
