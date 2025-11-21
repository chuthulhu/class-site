// dom.js - 기본 탭 전환 및 간단 유틸
export function initTabs(selector = '.tab-button') {
  const tabs = document.querySelectorAll(selector);
  const contents = document.querySelectorAll('.tab-content');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabs.forEach(b => b.classList.toggle('active', b === btn));
      contents.forEach(c => c.classList.toggle('active', c.id === target));
      window.scrollTo({ top: 0 });
    });
  });
}

export function qs(id){ return document.getElementById(id); }
export function show(el){ el?.classList.remove('hidden'); }
export function hide(el){ el?.classList.add('hidden'); }
