// hub-gate.js - 허브 세션 버튼 게이트
import { UNLOCK_AT } from './hub-config.js';

export async function initHubGate(){
  const s1 = document.getElementById('session1_link');
  const s2 = document.getElementById('session2_link');
  const notice = document.getElementById('session_locked_notice');
  if(!s1 || !s2) return;
  try{ const u=new URL(location.href); const k=u.searchParams.get('key'); if(k) sessionStorage.setItem('teacher_key', k); }catch{}
  const teacherKey = sessionStorage.getItem('teacher_key') || '';
  try {
    const res = await fetch('/.netlify/functions/time',{cache:'no-store'});
    if(!res.ok) throw new Error('time fetch failed');
    const data = await res.json();
    const nowUTC = typeof data?.now==='number'?data.now:Date.parse(data?.iso||'');
    const unlock = teacherKey || nowUTC >= Date.parse(UNLOCK_AT);
    if(unlock){
      if(teacherKey){ [s1,s2].forEach(a=>{ const url=new URL(a.getAttribute('href'),location.origin); url.searchParams.set('key',teacherKey); a.href=url.pathname+url.search; }); }
      s1.classList.remove('hidden'); s2.classList.remove('hidden'); s1.setAttribute('aria-disabled','false'); s2.setAttribute('aria-disabled','false'); notice?.classList.add('hidden');
    } else {
      s1.classList.add('hidden'); s2.classList.add('hidden'); s1.setAttribute('aria-disabled','true'); s2.setAttribute('aria-disabled','true'); notice?.classList.remove('hidden');
    }
  } catch {
    s1.classList.add('hidden'); s2.classList.add('hidden'); notice?.classList.remove('hidden');
  }
}
