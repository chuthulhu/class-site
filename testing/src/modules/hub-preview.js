// hub-preview.js - 폼 입력 -> 미리보기 동기화
import { FIELD_PREVIEW_MAP } from './hub-config.js';
import { escapeHtml } from './hub-utils.js';
import { renderSourcesPreview } from './hub-sources-extended.js';

function applySingleBinding(fieldId, previewId){
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
}

export function bindFieldPreviewsSubset({ include=null } = {}){
  const entries = Object.entries(FIELD_PREVIEW_MAP)
    .filter(([fieldId]) => !include || include.includes(fieldId));
  entries.forEach(([fid,pid]) => applySingleBinding(fid,pid));
  refreshDynamicPreviews();
}

export function bindFieldPreviews(){
  bindFieldPreviewsSubset();
}

// 고려사항(1차시) 렌더링/출처 갱신을 한 번에 처리
export function refreshDynamicPreviews(){
  // 1차시 고려사항 구성 필드 존재할 때만 처리
  const cWrap = document.getElementById('preview_considerations');
  const c1tEl = document.getElementById('field_c1_title');
  const c2tEl = document.getElementById('field_c2_title');
  if(cWrap && (c1tEl || c2tEl)){
    const c1t=(c1tEl?.value||'').trim(); const c1d=(document.getElementById('field_c1_desc')?.value||'').trim();
    const c2t=(c2tEl?.value||'').trim(); const c2d=(document.getElementById('field_c2_desc')?.value||'').trim();
    const items=[];
    const makeItem=(title,desc,idx)=>{
      const safeTitle = title?escapeHtml(title):`<span class="preview-placeholder">[고려사항 ${idx}]</span>`;
      const safeDesc = desc?escapeHtml(desc):'<span class="preview-placeholder">이유/근거를 입력하세요.</span>';
      return `<li class='preview-text'><strong style="font-family:'Noto Sans KR',sans-serif;">${safeTitle}</strong>:<br>${safeDesc}</li>`;
    };
    if(c1t||c1d) items.push(makeItem(c1t,c1d,1));
    if(c2t||c2d) items.push(makeItem(c2t,c2d,2));
    if(items.length){ cWrap.innerHTML=`<ol class='list-decimal list-inside space-y-3'>${items.join('')}</ol>`; }
    else { cWrap.innerHTML=`<p class='preview-text'><span class='preview-placeholder'>고려사항을 입력하세요...</span></p>`; }
  }
  const sourcesContainer = document.getElementById('sources_container');
  if(sourcesContainer){ renderSourcesPreview(sourcesContainer); }
}

// 변화 감지 트리거 (세션 스크립트에서 호출)
export function wireDynamicPreviewAutoRefresh(){
  const ids=['field_c1_title','field_c1_desc','field_c2_title','field_c2_desc'];
  ids.forEach(id=>{ const el=document.getElementById(id); if(el){ el.addEventListener('input', refreshDynamicPreviews); }});
}
