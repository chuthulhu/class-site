// hub-preview.js - 폼 입력 -> 미리보기 동기화
import { FIELD_PREVIEW_MAP } from './hub-config.js';
import { escapeHtml } from './hub-utils.js';
import { renderSourcesPreview } from './hub-sources-extended.js';

export function bindFieldPreviews(){
  Object.entries(FIELD_PREVIEW_MAP).forEach(([fieldId, previewId]) => {
    const input = document.getElementById(fieldId);
    const prev = document.getElementById(previewId);
    if(!input || !prev) return;
    const update = () => {
      const v = input.value.trim();
      const phSpan = prev.querySelector('.preview-placeholder');
      const placeholderText = phSpan ? phSpan.textContent : `[${fieldId}]`;
      if(v) prev.textContent = v; else prev.innerHTML = `<span class='preview-placeholder'>${escapeHtml(placeholderText)}</span>`;
    };
    input.addEventListener('input', update);
    update();
  });
  const sourcesContainer = document.getElementById('sources_container');
  if(sourcesContainer){ renderSourcesPreview(sourcesContainer); }
}
