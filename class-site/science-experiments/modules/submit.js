// submit.js - Netlify Function 제출 (간단 1차)
export async function submitData({ endpoint='/api/submit', payload }) {
  const res = await fetch(endpoint, {
    method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload)
  });
  if(!res.ok) throw new Error('제출 실패: '+res.status);
  return res.json();
}
