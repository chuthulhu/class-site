// netlify/functions/submit.js
export async function handler(event) {
    const headers = {
      'Access-Control-Allow-Origin': '*', // 테스트용. 배포 후 'https://<주인님-도메인>'으로 변경 권장
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,X-Submission-Key'
    };
    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };
  
    try {
      if (event.httpMethod !== 'POST') throw new Error('POST only');
  
      // (선택) Netlify에 SUBMIT_KEY를 추가했다면 간단 인증
      if (process.env.SUBMIT_KEY && event.headers['x-submission-key'] !== process.env.SUBMIT_KEY) {
        return { statusCode: 401, headers, body: 'unauthorized' };
      }
  
      const { studentId, name, filename, contentBase64 } = JSON.parse(event.body || '{}');
      if (!studentId || !filename || !contentBase64) throw new Error('missing fields');
  
      const safe = s => String(s).replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 80);
      const owner = 'chuthulhu';
      const repo  = '2025storage';
      const path  = `submissions/${safe(studentId)}/${Date.now()}-${safe(filename)}`;
  
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.GH_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'netlify-function'
        },
        body: JSON.stringify({
          message: `submission: ${studentId} ${name || ''} -> ${filename}`,
          content: contentBase64, // base64 문자열
          committer: { name: 'Submit Bot', email: 'noreply@example.com' }
        })
      });
  
      if (!res.ok) {
        const txt = await res.text();
        return { statusCode: res.status, headers, body: txt };
      }
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify({ path: data.content.path }) };
    } catch (e) {
      return { statusCode: 400, headers, body: String(e) };
    }
  }
  