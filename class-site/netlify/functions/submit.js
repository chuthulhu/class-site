// netlify/functions/submit.js
export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Submission-Key'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };

  try {
    if (event.httpMethod !== 'POST') throw new Error('POST only');

    const headerKey = (event.headers['x-submission-key'] || event.headers['X-Submission-Key']);
    if (process.env.SUBMIT_KEY && headerKey !== process.env.SUBMIT_KEY) {
      return { statusCode: 401, headers, body: 'unauthorized' };
    }

    const { studentId, name, filename, contentBase64, subject, section } = JSON.parse(event.body || '{}');
    if (!studentId || !filename || !contentBase64) throw new Error('missing fields');

    // Build target path: submissions/{assignment}/{section}/{studentId}/{filename}
    const assignment = process.env.ASSIGNMENT || subject || 'suhaeng3';
    const owner = 'chuthulhu';
    const repo  = '2025storage';

    const safeId = String(studentId).replace(/[^0-9A-Za-z_-]/g, '_');
    const safeSection = String(section || '').replace(/[^0-9A-Za-z_-]/g, '_');
    // Keep UTF-8 filenames in GitHub: use encodeURIComponent per segment
    const segments = ['submissions', assignment, safeSection || safeId.slice(0, 3), safeId, filename];
    const encodedPath = segments.map(s => encodeURIComponent(s)).join('/');

    // Check if file exists to update (keep only latest)
    let sha;
    const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`, {
      headers: {
        'Authorization': `Bearer ${process.env.GH_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'netlify-function'
      }
    });
    if (getRes.ok) {
      const exist = await getRes.json();
      sha = exist.sha;
    }

    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.GH_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'netlify-function'
      },
      body: JSON.stringify({
        message: sha ? `update submission: ${studentId} ${name || ''} -> ${filename}` : `submission: ${studentId} ${name || ''} -> ${filename}`,
        content: contentBase64,
        sha,
        committer: { name: 'Submit Bot', email: 'noreply@example.com' }
      })
    });

    if (!putRes.ok) return { statusCode: putRes.status, headers, body: await putRes.text() };
    const data = await putRes.json();
    return { statusCode: 200, headers, body: JSON.stringify({ path: data.content.path }) };
  } catch (e) {
    return { statusCode: 400, headers, body: String(e) };
  }
}
