// hub-sources-extended.js - 원본 Hub 고급 출처 UI (동적 필드)
import { SOURCE_TYPES } from './hub-config.js';
import { escapeHtml } from './hub-utils.js';

export function addSourceElement(container, type = '논문', values = null){
  const entryDiv = document.createElement('div');
  entryDiv.className = 'source-entry border p-4 rounded-md bg-gray-50 space-y-3';
  entryDiv.dataset.type = type;
  entryDiv.innerHTML = `<div class="flex justify-between items-center">
    <select class="source-type-select p-2 border border-gray-300 rounded-md bg-white">
      ${Object.keys(SOURCE_TYPES).map(opt => `<option ${opt===type?'selected':''}>${opt}</option>`).join('')}
    </select>
    <button class="delete_source_btn bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600 text-sm">삭제</button>
  </div>
  <div class="source-inputs grid grid-cols-1 sm:grid-cols-2 gap-2"></div>`;
  container.appendChild(entryDiv);
  updateSourceInputs(entryDiv.querySelector('.source-type-select'), values);
  return entryDiv;
}

export function updateSourceInputs(selectEl, values = null){
  const wrapper = selectEl.closest('.source-entry');
  const inputsContainer = wrapper.querySelector('.source-inputs');
  const type = selectEl.value;
  wrapper.dataset.type = type;
  const fields = SOURCE_TYPES[type];
  let i = 0;
  inputsContainer.innerHTML = Object.entries(fields).map(([label, required]) => {
    const val = values?.[i] || '';
    i++;
    return `<label class='block'><span class='text-gray-700 text-sm'>${label}${required?'<span class="text-red-500">*</span>':''}</span><input type='text' placeholder='${label}' value='${escapeHtml(val)}' class='w-full p-2 mt-1 border border-gray-300 rounded-md text-sm'/></label>`;
  }).join('');
}

export function serializeSources(container){
  return Array.from(container.querySelectorAll('.source-entry')).map(entry => ({
    type: entry.dataset.type,
    values: Array.from(entry.querySelectorAll('input')).map(i => i.value)
  }));
}

export function renderSourcesPreview(container){
  const previewEl = document.getElementById('preview_sources');
  const entries = container.querySelectorAll('.source-entry');
  if(!previewEl) return;
  if(!entries.length){
    previewEl.innerHTML = `<span class="preview-placeholder">내용을 입력하세요...</span>`;
    return;
  }
  const list = [];
  entries.forEach(entry => {
    const type = entry.dataset.type;
    const values = Array.from(entry.querySelectorAll('input')).map(i => escapeHtml(i.value.trim()));
    let parts = [];
    switch(type){
      case '논문':
        if(values[0]) parts.push(values[0]);
        if(values[1]) parts.push(`(${values[1]})`);
        if(values[2]) parts.push(`${values[2]}.`);
        if(values[3]) parts.push(values[3]);
        if(values[4] || values[5]) parts.push(`, ${values[4]||''}(${values[5]||''})`);
        if(values[6]) parts.push(`, ${values[6]}`);
        break;
      case '도서':
        if(values[0]) parts.push(values[0]);
        if(values[3]) parts.push(`(${values[3]})`);
        if(values[1]) parts.push(`${values[1]}.`);
        if(values[2]) parts.push(values[2]);
        break;
      case '학술잡지':
        if(values[2]) parts.push(values[2]);
        if(values[3]) parts.push(`(${values[3]})`);
        if(values[1]) parts.push(`${values[1]}.`);
        if(values[0]) parts.push(values[0]);
        break;
      case '인터넷 URL':
        if(values[2]) parts.push(values[2]);
        if(values[0]) parts.push(values[0]);
        if(values[1]) parts.push(`'${values[1]}'.`);
        if(values[3]) parts.push(`URL: ${values[3]}`);
        break;
    }
    let li = parts.join(' ').replace(/\s\./g,'.').replace(/\s,/g,',');
    list.push(`<li>${li}</li>`);
  });
  previewEl.innerHTML = `<ol class='list-decimal list-inside' style='line-height:1.8;'>${list.join('')}</ol>`;
}
