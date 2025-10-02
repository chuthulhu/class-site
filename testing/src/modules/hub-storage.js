// hub-storage.js - 메인 폼/출처 로컬 저장
import { STORAGE_KEY_MAIN, SUBMIT_META_KEY } from './hub-config.js';
import { serializeSources, addSourceElement, updateSourceInputs } from './hub-sources-extended.js';
import { debounce } from './hub-utils.js';

export function loadAll(){
  const raw = localStorage.getItem(STORAGE_KEY_MAIN);
  if(!raw) return;
  try{
    const data = JSON.parse(raw);
    Object.entries(data).forEach(([k,v]) => {
      if(k==='sources' && Array.isArray(v)){
        const container = document.getElementById('sources_container');
        if(container){ v.forEach(s => addSourceElement(container, s.type, s.values)); }
      } else {
        const el = document.getElementById(k); if(el) el.value = v;
      }
    });
  }catch{}
}

export function saveAll(){
  const obj = {};
  document.querySelectorAll('#tab4 input, #tab4 textarea, input#student_grade, input#student_class, input#student_number, input#student_name')
    .forEach(el => obj[el.id] = el.value);
  const container = document.getElementById('sources_container');
  if(container) obj.sources = serializeSources(container);
  try{ localStorage.setItem(STORAGE_KEY_MAIN, JSON.stringify(obj)); }catch{}
}

export const saveAllDebounced = debounce(saveAll, 300);

export function bindAutosave(){
  document.querySelectorAll('#tab4 input, #tab4 textarea').forEach(el => {
    el.addEventListener('input', () => { saveAllDebounced(); });
  });
}

export function saveSubmitMeta(){
  const meta = {
    grade: document.getElementById('student_grade')?.value || '',
    class: document.getElementById('student_class')?.value || '',
    number: document.getElementById('student_number')?.value || '',
    name: document.getElementById('student_name')?.value || '',
  };
  try{ localStorage.setItem(SUBMIT_META_KEY, JSON.stringify(meta)); }catch{}
}
export function loadSubmitMeta(){
  try{ const raw = localStorage.getItem(SUBMIT_META_KEY); if(!raw) return; const meta=JSON.parse(raw); if(meta.grade!=null) document.getElementById('student_grade').value=meta.grade; if(meta.class!=null) document.getElementById('student_class').value=meta.class; if(meta.number!=null) document.getElementById('student_number').value=meta.number; if(meta.name!=null) document.getElementById('student_name').value=meta.name; }catch{}
}
export function bindSubmitMetaAutosave(){ ['student_grade','student_class','student_number','student_name'].forEach(id => { const el=document.getElementById(id); if(el) el.addEventListener('input', saveSubmitMeta); }); }
