// hub-app.js - Hub 메인 초기화 (원본 기능 모듈화)
import { initHubGate } from './hub-gate.js';
import { bindFieldPreviews } from './hub-preview.js';
import { loadAll, bindAutosave, loadSubmitMeta, bindSubmitMetaAutosave, saveAllDebounced, saveSubmitMeta } from './hub-storage.js';
import { addSourceElement, updateSourceInputs, renderSourcesPreview } from './hub-sources-extended.js';
import { generateDocHtml, buildZipAndSubmit } from './hub-submit.js';
import { detectInApp, isIOS, blobToBase64 } from './hub-utils.js';
import { FIELD_PREVIEW_MAP } from './hub-config.js';

function qs(id){ return document.getElementById(id); }
function toast(msg,bg='bg-gray-800'){ const t=qs('toast-notification'); if(!t) return; clearTimeout(t.__timer); t.textContent=msg; t.className='fixed bottom-5 right-5 text-white py-3 px-5 rounded-lg shadow-lg transition-opacity duration-300 no-print '+bg; t.style.opacity=1; t.__timer=setTimeout(()=>{t.style.opacity=0;},2000); }

function bindTabs(){ document.querySelectorAll('.tab-button').forEach(btn=>btn.addEventListener('click',()=>{ const target=btn.dataset.tab; document.querySelectorAll('.tab-button').forEach(b=>b.classList.toggle('active',b===btn)); document.querySelectorAll('.tab-content').forEach(c=>c.classList.toggle('active',c.id===target)); window.scrollTo(0,0); })); }
function bindAccordions(){ document.querySelectorAll('.accordion-header button').forEach(b=>b.addEventListener('click',e=>{ const btn=e.currentTarget; const content=btn.parentElement.nextElementSibling; const icon=btn.querySelector('svg'); const isOpen=btn.classList.toggle('open'); content.classList.toggle('open',isOpen); if(isOpen){ content.style.maxHeight=content.scrollHeight+'px'; content.style.paddingTop='1rem'; content.style.paddingBottom='1rem'; if(icon) icon.style.transform='rotate(180deg)'; } else { content.style.maxHeight='0'; content.style.paddingTop='0'; content.style.paddingBottom='0'; if(icon) icon.style.transform='rotate(0deg)'; } })); }

function bindSourceEvents(){ const container=qs('sources_container'); const addBtn=qs('add_source_btn'); if(!container||!addBtn) return; addBtn.addEventListener('click',()=>{ addSourceElement(container); renderSourcesPreview(container); saveAllDebounced(); }); container.addEventListener('click',e=>{ if(e.target.classList.contains('delete_source_btn')){ e.target.closest('.source-entry').remove(); renderSourcesPreview(container); saveAllDebounced(); } }); container.addEventListener('change',e=>{ if(e.target.classList.contains('source-type-select')){ updateSourceInputs(e.target); renderSourcesPreview(container); saveAllDebounced(); } }); container.addEventListener('input',()=>{ renderSourcesPreview(container); saveAllDebounced(); }); }

function printReport(){ const orig=document.title; document.title=getReportFilename(); window.print(); setTimeout(()=>{ document.title=orig; },500); }
function getReportFilename(){ const g=(qs('student_grade')?.value||'1').trim(); const c=(qs('student_class')?.value||'0').trim().padStart(2,'0'); const n=(qs('student_number')?.value||'0').trim().padStart(2,'0'); const id=`${g}${c}${n}`; const name=(qs('student_name')?.value||'이름없음').trim(); return `${id}_${name}_스마트모빌리티_제안서`; }
function validateStudentMeta(){ const grade=parseInt((qs('student_grade')?.value||'').trim(),10); const klass=parseInt((qs('student_class')?.value||'').trim(),10); const number=parseInt((qs('student_number')?.value||'').trim(),10); const name=(qs('student_name')?.value||'').trim(); if(Number.isNaN(grade)||grade<1||grade>3){ toast('학년은 1~3 사이'); qs('student_grade').focus(); return null; } if(Number.isNaN(klass)||klass<1||klass>20){ toast('반은 1~20 사이'); qs('student_class').focus(); return null; } if(Number.isNaN(number)||number<1||number>40){ toast('번호는 1~40 사이'); qs('student_number').focus(); return null; } if(!name){ toast('이름을 입력하세요.'); qs('student_name').focus(); return null; } return { grade, klass, number, name }; }

function calcSectionCode(g,k){ return `${String(g).trim()}${String(k).trim().padStart(2,'0')}`; }
function calcStudentId(g,k,n){ return `${String(g).trim()}${String(k).trim().padStart(2,'0')}${String(n).trim().padStart(2,'0')}`; }

function bindSubmitFlow(){ const downloadBtn=qs('download_zip_btn'); const retryBtn=qs('retry_upload_btn'); const printBtn=qs('print_btn'); const previewBtn=qs('preview_newtab_btn'); const progressC=qs('progress_container'); const progressBar=qs('progress_bar'); const progressText=qs('progress_text'); const statusEl=qs('submit_status'); let lastZipBlob=null; let lastMeta=null;
  function setStatus(t){ if(statusEl) statusEl.textContent=t; }
  function setProgress(p,label=''){ if(progressBar) progressBar.style.width=`${Math.max(0,Math.min(100,p))}%`; if(progressText) progressText.textContent=label; }
  function showProgress(show){ if(progressC){ progressC.classList.toggle('hidden',!show); progressC.setAttribute('aria-hidden', show?'false':'true'); } }
  function disableUI(dis){ [downloadBtn, printBtn, previewBtn].forEach(b=>{ if(b) b.disabled=dis; }); }

  async function attemptDownloadAndSubmit(){ const form=validateStudentMeta(); if(!form) return; disableUI(true); retryBtn?.classList.add('hidden'); setStatus('문서 생성 준비...'); showProgress(true); setProgress(10,'준비'); const section=calcSectionCode(form.grade, form.klass); const studentId=calcStudentId(form.grade, form.klass, form.number); const nowParts=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).formatToParts(new Date()); const parts=Object.fromEntries(nowParts.map(p=>[p.type,p.value])); const ts=`${parts.year}${parts.month}${parts.day}_${parts.hour}${parts.minute}${parts.second}`; const baseName=`${studentId}_${form.name}_${qs('preview_main_title')?.textContent?.trim()||'보고서'}_${ts}`;
    try{
      const result = await buildZipAndSubmit({
        buildHtml: (title, inner)=>generateDocHtml(title, inner),
        filenameBase: baseName,
        reportSelector: '#report-content',
        onProgress: setProgress,
        onStatus: setStatus,
        payloadBuilder: (b64, zipFilename)=>({
          studentId, subject: document.querySelector('meta[name="submission-subject"]')?.content||'과학탐구실험2', section, files:[{ filename: zipFilename, contentBase64: b64, mime: 'application/zip' }]
        })
      });
      lastZipBlob = result.zipBlob; lastMeta={ zipFilename: result.zipFilename, studentId, name: form.name, section };
      setStatus('다운로드 환경 감지 중...'); setProgress(88,'다운로드 준비');
      attemptLocalDownload(lastZipBlob, lastMeta.zipFilename, { status:setStatus });
      setProgress(100,'완료'); setTimeout(()=>showProgress(false),1500);
      toast('제출 & 다운로드 완료','bg-green-600');
    }catch(e){ setStatus(`실패: ${e.message}`); toast(`실패: ${e.message}`,'bg-red-600'); retryBtn?.classList.remove('hidden'); }
    finally{ disableUI(false); }
  }

  downloadBtn?.addEventListener('click', attemptDownloadAndSubmit);
  retryBtn?.addEventListener('click', attemptDownloadAndSubmit);
  printBtn?.addEventListener('click', printReport);
  previewBtn?.addEventListener('click', openPreviewInNewTab);
}

function openPreviewInNewTab(){ try{ const inner=qs('report-content')?.innerHTML||''; const now=new Date(); const ts=`${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`; const title=`미리보기-${ts}`; const html=generateDocHtml(title, inner); const blob=new Blob([html],{type:'text/html'}); const url=URL.createObjectURL(blob); window.open(url,'_blank'); setTimeout(()=>URL.revokeObjectURL(url),10000); }catch{}
}

function attemptLocalDownload(blob, filename, { status }){
  const env=detectInApp();
  if(env.isInApp){ status('앱 내 브라우저: 서버 다운로드 모달 표시 예정'); return; }
  if(isIOS()){ status('iOS 공유 시트 안내 필요'); return; }
  try{ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href); status('다운로드 완료'); toast('ZIP 다운로드 완료','bg-green-600'); }catch{ status('다운로드 실패'); }
}

export function initHub(){
  initHubGate();
  bindTabs();
  bindAccordions();
  loadAll();
  loadSubmitMeta();
  bindFieldPreviews();
  bindSourceEvents();
  bindAutosave();
  bindSubmitMetaAutosave();
  bindSubmitFlow();
}
