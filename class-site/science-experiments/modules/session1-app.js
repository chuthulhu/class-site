// session1-app.js - 1차시 페이지 모듈 (테스트용) - 공유 모듈(hub-*) 재사용
import { generateDocHtml, buildZipAndSubmit, buildZip, submitBuiltZip } from './hub-submit.js';
import { addSourceElement, updateSourceInputs, renderSourcesPreview, serializeSources } from './hub-sources-extended.js';
import { escapeHtml, debounce } from './hub-utils.js';
import { downloadWithFallback } from './hub-download.js';
import { bindFieldPreviewsSubset, refreshDynamicPreviews, wireDynamicPreviewAutoRefresh } from './hub-preview.js';

// 개별 세션 저장 키 (허브와 분리)
const STORAGE_KEY = 'firstLastMileProjectData_session1';
const SUBMIT_META_KEY = 'submit_meta_session1';
const MAX_ZIP_BYTES = 8 * 1024 * 1024; // 8MB
const SUBMISSION_ENDPOINT = '/.netlify/functions/submit';
const SUBMISSION_KEY_HEADER = 'X-Submission-Key';
const SUBMISSION_KEY_VALUE = 'S-2025-github2025subject';

function qs(id){ return document.getElementById(id); }

function toast(msg,bg='bg-gray-800'){
  const t=qs('toast-notification'); if(!t) return; clearTimeout(t.__timer);
  t.textContent=msg; t.className=`fixed bottom-5 right-5 text-white py-3 px-5 rounded-lg shadow-lg transition-opacity duration-300 no-print ${bg}`;
  t.style.opacity=1; t.__timer=setTimeout(()=>{t.style.opacity=0;},1800);
}

function bindTabs(){ document.querySelectorAll('.tab-button').forEach(btn=>btn.addEventListener('click',()=>{ const target=btn.dataset.tab; document.querySelectorAll('.tab-button').forEach(b=>b.classList.toggle('active',b===btn)); document.querySelectorAll('.tab-content').forEach(c=>c.classList.toggle('active',c.id===target)); window.scrollTo(0,0);})); }
function bindAccordions(){ document.querySelectorAll('.accordion-header button').forEach(b=>{ b.addEventListener('click',e=>{ const btn=e.currentTarget; const content=btn.parentElement.nextElementSibling; const icon=btn.querySelector('svg'); const open=!btn.classList.contains('open'); btn.classList.toggle('open',open); content.classList.toggle('open',open); if(open){ setTimeout(()=>{ content.style.maxHeight=content.scrollHeight+'px'; content.style.paddingTop='1rem'; content.style.paddingBottom='1rem'; },10); if(icon) icon.style.transform='rotate(180deg)'; } else { content.style.maxHeight='0'; content.style.paddingTop='0'; content.style.paddingBottom='0'; if(icon) icon.style.transform='rotate(0deg)'; } }); }); }

// ---- 저장 / 로드 ----
function loadAll(){ const raw=localStorage.getItem(STORAGE_KEY); if(!raw) return; try{ const data=JSON.parse(raw); Object.entries(data).forEach(([k,v])=>{ if(k==='sources' && Array.isArray(v)){ const container=qs('sources_container'); if(container) v.forEach(s=>addSourceElement(container,s)); } else { const el=qs(k); if(el) el.value=v; } }); }catch{} }
function saveAll(){ const obj={}; document.querySelectorAll('#tab4 input,#tab4 textarea,input#student_grade,input#student_class,input#student_number,input#student_name').forEach(el=>obj[el.id]=el.value); const container=qs('sources_container'); if(container) obj.sources = serializeSources(container); try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }catch{} }
const saveAllDebounced = debounce(saveAll,300);

function saveSubmitMeta(){ const meta={ grade:qs('student_grade')?.value||'', class:qs('student_class')?.value||'', number:qs('student_number')?.value||'', name:qs('student_name')?.value||'' }; try{ localStorage.setItem(SUBMIT_META_KEY, JSON.stringify(meta)); }catch{} }
function loadSubmitMeta(){ try{ const raw=localStorage.getItem(SUBMIT_META_KEY); if(!raw) return; const meta=JSON.parse(raw); if(meta.grade!=null) qs('student_grade').value=meta.grade; if(meta.class!=null) qs('student_class').value=meta.class; if(meta.number!=null) qs('student_number').value=meta.number; if(meta.name!=null) qs('student_name').value=meta.name; }catch{} }

// ---- 미리보기 ----
// 미리보기 개별 구현 제거 -> 공통 모듈 사용

// ---- 출처 ----
function bindSourceEvents(){ const c=qs('sources_container'); const addBtn=qs('add_source_btn'); if(!c||!addBtn) return; addBtn.addEventListener('click',()=>{ addSourceElement(c); renderSourcesPreview(c); saveAllDebounced(); }); c.addEventListener('click',e=>{ if(e.target.classList.contains('delete_source_btn')){ e.target.closest('.source-entry')?.remove(); renderSourcesPreview(c); saveAllDebounced(); }}); c.addEventListener('change',e=>{ if(e.target.classList.contains('source-type-select')){ updateSourceInputs(e.target); renderSourcesPreview(c); saveAllDebounced(); }}); c.addEventListener('input',()=>{ renderSourcesPreview(c); saveAllDebounced(); }); }

// ---- 제출 / ZIP ----
function validateStudent(){ const grade=parseInt((qs('student_grade')?.value||'').trim(),10); const klass=parseInt((qs('student_class')?.value||'').trim(),10); const number=parseInt((qs('student_number')?.value||'').trim(),10); const name=(qs('student_name')?.value||'').trim(); if(Number.isNaN(grade)||grade<1||grade>3){ toast('학년은 1~3 사이'); qs('student_grade')?.focus(); return null; } if(Number.isNaN(klass)||klass<1||klass>20){ toast('반은 1~20 사이'); qs('student_class')?.focus(); return null; } if(Number.isNaN(number)||number<1||number>40){ toast('번호는 1~40 사이'); qs('student_number')?.focus(); return null; } if(!name){ toast('이름을 입력'); qs('student_name')?.focus(); return null; } return { grade, klass, number, name }; }
function calcSectionCode(g,k){ return `${String(g)}${String(k).padStart(2,'0')}`; }
function calcStudentId(g,k,n){ return `${String(g)}${String(k).padStart(2,'0')}${String(n).padStart(2,'0')}`; }

function bindSubmit(){ const downloadBtn=qs('download_zip_btn'); const retryBtn=qs('retry_upload_btn'); const printBtn=qs('print_btn'); const previewBtn=qs('preview_newtab_btn'); const statusEl=qs('submit_status'); const progressC=qs('progress_container'); const bar=qs('progress_bar'); const txt=qs('progress_text'); let lastZipBlob=null; let lastMeta=null; let lastPayloadBuilder=null; let lastZipFilename=null;
  function setStatus(t){ if(statusEl) statusEl.textContent=t; }
  function setProgress(p,label=''){ if(bar) bar.style.width=`${Math.min(100,Math.max(0,p))}%`; if(txt) txt.textContent=label; }
  function showProgress(show){ if(progressC){ progressC.classList.toggle('hidden',!show); progressC.setAttribute('aria-hidden', show?'false':'true'); } }
  function printReport(){ const original=document.title; document.title=getReportFilename(); window.print(); setTimeout(()=>{ document.title=original; },400); }
  function getReportFilename(){ const g=(qs('student_grade')?.value||'1').trim(); const c=(qs('student_class')?.value||'0').trim().padStart(2,'0'); const n=(qs('student_number')?.value||'0').trim().padStart(2,'0'); const id=`${g}${c}${n}`; const name=(qs('student_name')?.value||'이름없음').trim(); return `${id}_${name}_스마트모빌리티_제안서_1차시`; }
  function openPreviewNewTab(){ try{ const inner=qs('report-content')?.innerHTML||''; const now=new Date(); const ts=`${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`; const title=`미리보기-1차시-${ts}`; const html=generateDocHtml(title,inner); const blob=new Blob([html],{type:'text/html'}); const url=URL.createObjectURL(blob); window.open(url,'_blank'); setTimeout(()=>URL.revokeObjectURL(url),10000);}catch{}
  }
  async function attempt(){ const form=validateStudent(); if(!form) return; retryBtn?.classList.add('hidden'); showProgress(true); setProgress(8,'문서 준비'); setStatus('문서 생성 중'); const section=calcSectionCode(form.grade, form.klass); const studentId=calcStudentId(form.grade, form.klass, form.number); const nowParts=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).formatToParts(new Date()); const parts=Object.fromEntries(nowParts.map(p=>[p.type,p.value])); const ts=`${parts.year}${parts.month}${parts.day}_${parts.hour}${parts.minute}${parts.second}`; const baseName=`${studentId}_${form.name}_${qs('preview_main_title')?.textContent?.trim()||'보고서'}_${ts}`;
    const payloadBuilder=(b64, zipFilename)=>({ studentId, subject: document.querySelector('meta[name="submission-subject"]')?.content||'과학탐구실험2', activity: (document.querySelector('meta[name="submission-activity"]')?.content||'수행3_1차시'), section, files:[{ filename: zipFilename, contentBase64: b64, mime:'application/zip' }] });
    try {
      const { zipBlob, zipFilename } = await buildZip({ buildHtml:(t,i)=>generateDocHtml(t,i), filenameBase: baseName, reportSelector:'#report-content', onProgress:(p,l)=>setProgress(p,l), onStatus:setStatus });
      lastZipBlob=zipBlob; lastZipFilename=zipFilename; lastPayloadBuilder=payloadBuilder; lastMeta={ zipFilename };
      const { data } = await submitBuiltZip({ zipBlob, zipFilename, payloadBuilder, onProgress:(p,l)=>setProgress(p,l), onStatus:setStatus });
      setProgress(90,'다운로드'); setStatus('다운로드 진행 중');
      await downloadWithFallback({ blob:zipBlob, filename:zipFilename, onStatus:setStatus, onToast:(m)=>toast(m) });
      setProgress(100,'완료'); setTimeout(()=>showProgress(false),1200); toast('제출 & 다운로드 완료','bg-green-600');
    }catch(e){ setStatus('실패: '+e.message); toast('실패: '+e.message,'bg-red-600'); showProgress(false); retryBtn?.classList.remove('hidden'); }
  }
  async function retry(){ if(!lastZipBlob||!lastPayloadBuilder||!lastZipFilename){ toast('재시도할 데이터가 없습니다.'); return; } retryBtn?.classList.add('hidden'); showProgress(true); setProgress(40,'재업로드'); setStatus('재업로드 중'); try{ const { data } = await submitBuiltZip({ zipBlob:lastZipBlob, zipFilename:lastZipFilename, payloadBuilder:lastPayloadBuilder, onProgress:(p,l)=>setProgress(p,l||'재업로드'), onStatus:setStatus }); setProgress(88,'다운로드'); await downloadWithFallback({ blob:lastZipBlob, filename:lastZipFilename, onStatus:setStatus, onToast:(m)=>toast(m) }); setProgress(100,'완료'); setTimeout(()=>showProgress(false),1200); toast('재제출 & 다운로드 완료','bg-green-600'); }catch(e){ setStatus('재시도 실패: '+e.message); toast('재시도 실패: '+e.message,'bg-red-600'); retryBtn?.classList.remove('hidden'); showProgress(false); } }
  downloadBtn?.addEventListener('click', attempt); retryBtn?.addEventListener('click', retry); printBtn?.addEventListener('click', printReport); previewBtn?.addEventListener('click', openPreviewNewTab);
}

function bindClear(){ const clearBtn=qs('clear_inputs_btn'); if(!clearBtn) return; clearBtn.addEventListener('click',()=>{ if(!window.confirm('입력한 내용을 모두 삭제하시겠어요?')) return; try{ localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(SUBMIT_META_KEY);}catch{} document.querySelectorAll('#tab4 input,#tab4 textarea').forEach(el=>{ el.value=''; }); const sc=qs('sources_container'); if(sc) sc.innerHTML=''; saveAll(); updateConsiderations(); toast('입력 내용이 삭제되었습니다.','bg-red-600'); }); }

export function initSession1(){
  bindTabs();
  bindAccordions();
  loadSubmitMeta();
  loadAll();
  bindFieldPreviewsSubset({ include:['student_grade','student_class','student_number','student_name','field_analysis','field_c1_title','field_c1_desc','field_c2_title','field_c2_desc'] });
  wireDynamicPreviewAutoRefresh();
  refreshDynamicPreviews();
  bindSourceEvents();
  bindSubmit();
  bindClear();
  // Autosave
  document.querySelectorAll('#tab4 input,#tab4 textarea').forEach(el=>el.addEventListener('input',()=>{ saveAllDebounced(); saveSubmitMeta(); refreshDynamicPreviews(); }));
  // 아코디언 펼치기
  document.querySelectorAll('.accordion-header button').forEach(b=>{ const content=b.parentElement.nextElementSibling; const icon=b.querySelector('svg'); b.classList.add('open'); content.classList.add('open'); setTimeout(()=>{ content.style.maxHeight=content.scrollHeight+'px'; content.style.paddingTop='1rem'; content.style.paddingBottom='1rem'; },10); if(icon) icon.style.transform='rotate(180deg)'; });
  refreshDynamicPreviews();
}

// DOMContentLoaded에서 init 호출 (HTML에서 import만 하면 됨)
document.addEventListener('DOMContentLoaded', initSession1);
