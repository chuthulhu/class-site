// sources.js - 정보출처 관리 (간단 1차 버전)
// 향후: 타입(인터넷 기사/게시물, 도서, 인터뷰 등)별 입력 확장

const STORAGE_PREFIX = 'sources_test_';

export function initSources({ key='default', containerId, addBtnId }) {
  const listKey = STORAGE_PREFIX + key;
  const container = document.getElementById(containerId);
  const addBtn = document.getElementById(addBtnId);
  if(!container || !addBtn) return;

  let sources = load();
  render();

  addBtn.addEventListener('click', () => {
    sources.push({ type:'인터넷 기사/게시물', title:'', url:'' });
    save();
    render();
  });

  function load(){
    try { const raw = localStorage.getItem(listKey); return raw?JSON.parse(raw):[]; } catch { return []; }
  }
  function save(){
    try { localStorage.setItem(listKey, JSON.stringify(sources)); } catch {}
  }
  function update(idx, field, value){
    sources[idx][field] = value;
    save();
  }
  function remove(idx){
    sources.splice(idx,1);
    save();
    render();
  }
  function render(){
    container.innerHTML = '';
    if(!sources.length){
      container.innerHTML = '<p class="text-gray-500 text-sm">출처가 없습니다. 추가 버튼을 눌러 등록하세요.</p>';
      return;
    }
    sources.forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'border rounded p-3 mb-3 bg-white';
      row.innerHTML = `
        <div class="flex flex-col gap-2">
          <div class="flex flex-col sm:flex-row gap-2">
            <input value="${escapeHtml(s.title)}" placeholder="제목" class="flex-1 border p-2 rounded text-sm" data-field="title" />
            <input value="${escapeHtml(s.url)}" placeholder="URL" class="flex-1 border p-2 rounded text-sm" data-field="url" />
          </div>
          <div class="flex justify-between text-xs text-gray-500">
            <span>${s.type}</span>
            <button class="text-red-500 hover:underline" data-action="remove">삭제</button>
          </div>
        </div>`;
      row.addEventListener('input', (e) => {
        const field = e.target.getAttribute('data-field');
        if(field){ update(i, field, e.target.value); }
      });
      row.querySelector('[data-action="remove"]').addEventListener('click', () => remove(i));
      container.appendChild(row);
    });
  }
  return { getAll: () => sources.slice(), add: () => { addBtn.click(); } };
}

export function sourcesToPreviewHTML(list){
  if(!list?.length) return '<p class="text-gray-500 italic">(등록된 출처 없음)</p>';
  return '<ol class="list-decimal ml-5 space-y-1">' + list.map(s => {
    const safeTitle = escapeHtml(s.title||'');
    const safeURL = escapeHtml(s.url||'');
    const link = safeURL ? `<a href="${safeURL}" target="_blank" class="text-blue-600 underline">${safeURL}</a>` : '';
    return `<li><strong>${safeTitle}</strong>${link?': '+link:''}</li>`;
  }).join('') + '</ol>';
}

function escapeHtml(str){
  return str.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' }[c]));
}
