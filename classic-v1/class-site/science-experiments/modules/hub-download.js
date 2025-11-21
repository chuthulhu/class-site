// hub-download.js - 인앱/환경 제약 시 서버 폴백 다운로드
import { detectInApp, blobToBase64 } from './hub-utils.js';

function trackServerDownload(token, { onStatus, onToast, timeoutMs=5000 }) {
  const key = `download_ok_${encodeURIComponent(token)}=`;
  const deadline = Date.now() + timeoutMs;
  const timer = setInterval(()=>{
    if (document.cookie.includes(key)) {
      clearInterval(timer);
      onStatus && onStatus('✅ 서버 첨부 다운로드 확인');
      onToast && onToast('다운로드 완료 확인');
    } else if (Date.now() > deadline) {
      clearInterval(timer);
    }
  }, 350);
}

function attemptAnchor(blob, filename){
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url), 4000);
    return true;
  } catch { return false; }
}

async function attemptPicker(blob, filename){
  if(!('showSaveFilePicker' in window)) return false;
  try{
    const handle = await window.showSaveFilePicker({ suggestedName: filename, types:[{ description:'ZIP file', accept:{'application/zip':['.zip']} }] });
    const writable = await handle.createWritable();
    await writable.write(blob); await writable.close();
    return true;
  }catch{ return false; }
}

async function serverFallback(blob, filename, { onStatus, onToast }){
  onStatus && onStatus('서버 다운로드 준비 중');
  const b64 = await blobToBase64(blob);
  const token = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  trackServerDownload(token, { onStatus, onToast });
  const form = document.createElement('form');
  form.method='POST'; form.action='/.netlify/functions/download'; form.target='_blank';
  const add=(n,v)=>{ const i=document.createElement('input'); i.type='hidden'; i.name=n; i.value=v; form.appendChild(i); };
  add('filename', filename); add('mime','application/zip'); add('contentBase64', b64); add('token', token);
  document.body.appendChild(form); form.submit(); document.body.removeChild(form);
  onToast && onToast('서버에서 다운로드 시작');
  onStatus && onStatus('서버 전송 완료');
}

export async function downloadWithFallback({ blob, filename, onStatus, onToast }){
  if(!blob) throw new Error('다운로드할 파일이 없습니다.');
  const env = detectInApp();
  if(env.isInApp){
    await serverFallback(blob, filename, { onStatus, onToast });
    return 'server';
  }
  // 우선 파일피커, 실패 시 앵커, 둘 다 안 되면 서버
  let saved = await attemptPicker(blob, filename);
  if(!saved) saved = attemptAnchor(blob, filename);
  if(saved){
    onStatus && onStatus('✅ 로컬 다운로드 완료');
    onToast && onToast('다운로드 완료');
    return 'local';
  }
  await serverFallback(blob, filename, { onStatus, onToast });
  return 'server';
}
