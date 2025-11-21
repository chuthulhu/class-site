// report.js - 보고서 조립 (1차 간단 버전)
import { sourcesToPreviewHTML } from './sources.js';

export function buildReportHTML({ title='[TEST] 보고서', sections=[], sources=[] }) {
  return `<!DOCTYPE html><html lang="ko"><head><meta charset='UTF-8'><title>${escapeHtml(title)}</title><style>
  body{font-family:'Noto Sans KR',sans-serif;line-height:1.6;margin:2rem;}
  h1{font-size:1.8rem;margin-bottom:1rem;}
  h2{font-size:1.2rem;margin-top:1.5rem;margin-bottom:.5rem;}
  .sources h2{margin-top:2rem;}
  </style></head><body>
  <h1>${escapeHtml(title)}</h1>
  ${sections.map(s => `<section><h2>${escapeHtml(s.heading)}</h2><div>${sectionBody(s.body)}</div></section>`).join('\n')}
  <section class='sources'><h2>정보출처</h2>${sourcesToPreviewHTML(sources)}</section>
  </body></html>`;
}

function sectionBody(text){
  if(!text?.trim()) return '<p style="color:#888">(내용 없음)</p>';
  return '<p>'+escapeHtml(text).replace(/\n/g,'<br>')+'</p>';
}
function escapeHtml(str){
  return str.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' }[c]));
}
