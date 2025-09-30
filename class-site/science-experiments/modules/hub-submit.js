// hub-submit.js - 업로드 + ZIP 생성
import { SUBMISSION_ENDPOINT, SUBMISSION_KEY_HEADER, SUBMISSION_KEY_VALUE, MAX_ZIP_BYTES } from './hub-config.js';
import { blobToBase64, bytesFromBase64 } from './hub-utils.js';

export async function buildZipAndSubmit({ buildHtml, filenameBase, onProgress, onStatus, reportSelector }) {
  onStatus('ZIP 파일 생성 중…');
  onProgress(20,'문서 HTML 생성');
  const inner = document.querySelector(reportSelector)?.innerHTML || '';
  const html = buildHtml(filenameBase, inner);
  const zip = new JSZip();
  const htmlFilename = `${filenameBase}.html`;
  const zipFilename = `${filenameBase}.zip`;
  zip.file(htmlFilename, html);
  const zipBlob = await zip.generateAsync({ type:'blob', compression:'DEFLATE', compressionOptions:{ level:6 } });
  if(zipBlob.size > MAX_ZIP_BYTES) throw new Error('ZIP 용량 초과 (8MB)');
  onProgress(40,'업로드 준비');
  const b64 = await blobToBase64(zipBlob);
  onProgress(55,'업로드 중');
  const payload = arguments[0].payloadBuilder(b64, zipFilename);
  const res = await fetch(SUBMISSION_ENDPOINT, {
    method:'POST', headers:{ 'Content-Type':'application/json', [SUBMISSION_KEY_HEADER]: SUBMISSION_KEY_VALUE }, body: JSON.stringify(payload)
  });
  const text = await res.text();
  let data={}; try{ data=JSON.parse(text);}catch{ data={ raw:text }; }
  if(!res.ok) throw new Error(data.error||data.detail||data.message||res.statusText||'업로드 실패');
  onProgress(85,'다운로드 준비');
  return { zipBlob, zipFilename, data };
}

export function generateDocHtml(dynamicTitle, reportInnerHtml){
  return `<!DOCTYPE html><html lang='ko'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1.0'><title>${dynamicTitle}</title><script src="https://cdn.tailwindcss.com"><\/script><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Nanum+Myeongjo:wght@400;700&display=swap" rel="stylesheet"><style>body{font-family:'Noto Sans KR','Inter',sans-serif;background:#f3f4f6;margin:0;}*{color:inherit!important}.report-page{background:#fff;padding:2.5cm 2cm;box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05);color:#1f2937}.printable-area{width:100%}.report-main-title{font-size:2.25rem;font-weight:700;text-align:center;margin-bottom:1rem;border-bottom:2px solid #111827;padding-bottom:1rem}.report-section-title{font-size:1.5rem;font-weight:700;margin-top:2.5rem;margin-bottom:1rem;padding-bottom:.5rem;border-bottom:1px solid #d1d5db}.preview-text{white-space:pre-wrap;word-break:break-word;min-height:2.5em;line-height:1.8;color:#374151;font-family:'Nanum Myeongjo',serif}.preview-placeholder{color:#9ca3af!important;font-style:italic}@page{size:A4 portrait;margin:2cm}@media print{body *{visibility:hidden}.printable-area,.printable-area *{visibility:visible}.printable-area{position:absolute;left:0;top:0;width:100%;padding:0;margin:0;box-shadow:none;border:none}.no-print{display:none}}</style></head><body><div class='report-page'><div class='printable-area'>${reportInnerHtml}</div></div></body></html>`;
}
