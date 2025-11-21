// env.js - 환경/플랫폼 및 teacher key 관련 헬퍼
export function getTeacherKey(){
  try { return sessionStorage.getItem('teacher_key') || ''; } catch { return ''; }
}
export function persistTeacherKeyFromURL(){
  try { const u=new URL(location.href); const k=u.searchParams.get('key'); if(k) sessionStorage.setItem('teacher_key', k); } catch {}
}
export function isIOS(){
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
}
export function isStandalonePWA(){ return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone; }
