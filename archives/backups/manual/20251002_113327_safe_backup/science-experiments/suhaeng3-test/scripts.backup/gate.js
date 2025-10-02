// gate.js - 공개 시점까지 세션 링크 감춤 + 교사용 key 유지
import { qs, show, hide } from './dom.js';

export function initGate({ unlockAt }) {
  const s1 = qs('session1_link');
  const s2 = qs('session2_link');
  const notice = qs('session_locked_notice');
  if(!s1 || !s2) return;

  // URL teacher key -> sessionStorage 보관
  try {
    const u = new URL(location.href);
    const key = u.searchParams.get('key');
    if(key) sessionStorage.setItem('teacher_key', key);
  } catch {}

  const teacherKey = sessionStorage.getItem('teacher_key') || '';

  fetch('/.netlify/functions/time', { cache:'no-store' })
    .then(r => r.json())
    .then(data => {
      const now = typeof data?.now === 'number' ? data.now : Date.parse(data?.iso||'');
      const unlockTime = Date.parse(unlockAt);
      const unlocked = teacherKey || (now >= unlockTime);
      if(unlocked){
        if(teacherKey){
          [s1, s2].forEach(a => {
            const url = new URL(a.getAttribute('href'), location.origin);
            url.searchParams.set('key', teacherKey);
            a.href = url.pathname + url.search;
          });
        }
        show(s1); show(s2); hide(notice);
        s1.setAttribute('aria-disabled','false');
        s2.setAttribute('aria-disabled','false');
      } else {
        hide(s1); hide(s2); show(notice);
        s1.setAttribute('aria-disabled','true');
        s2.setAttribute('aria-disabled','true');
      }
    })
    .catch(()=>{
      // 실패 시 안전하게 숨김 유지
      hide(s1); hide(s2); show(notice);
    });
}
