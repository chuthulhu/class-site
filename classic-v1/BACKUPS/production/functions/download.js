// Netlify Function: download
// Accepts POST with fields: filename, mime, contentBase64 (raw base64, no data URL)
// Returns the file as an attachment response (binary) for in-app browsers.

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } };
    }
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const ct = (event.headers['content-type'] || event.headers['Content-Type'] || '').toLowerCase();
    let fields = {};

    if (ct.includes('application/json')) {
      fields = JSON.parse(event.body || '{}');
    } else if (ct.includes('application/x-www-form-urlencoded')) {
      fields = Object.fromEntries((event.body || '').split('&').map(pair => {
        const [k, v] = pair.split('=');
        return [decodeURIComponent(k || ''), decodeURIComponent((v || '').replace(/\+/g, ' '))];
      }));
    } else if (ct.startsWith('multipart/form-data')) {
      // Minimal parser for small forms; recommend x-www-form-urlencoded for large payloads.
      // Fallback: treat as raw body JSON if client sent JSON with wrong header.
      try { fields = JSON.parse(event.body || '{}'); } catch (_) { fields = {}; }
    } else {
      // Try JSON, else fallback to urlencoded
      try { fields = JSON.parse(event.body || '{}'); }
      catch (_) {
        fields = Object.fromEntries((event.body || '').split('&').map(pair => {
          const [k, v] = pair.split('=');
          return [decodeURIComponent(k || ''), decodeURIComponent((v || '').replace(/\+/g, ' '))];
        }));
      }
    }

    const filename = (fields.filename || 'download.bin').toString();
    const mime = (fields.mime || 'application/octet-stream').toString();
    const contentBase64 = (fields.contentBase64 || '').toString().trim();
    const token = (fields.token || '').toString().trim();
    if (!contentBase64) {
      return { statusCode: 400, body: 'contentBase64 is required' };
    }

    // Size guard (8 MiB)
    let byteLen = 0;
    try { byteLen = Buffer.from(contentBase64, 'base64').length; } catch (_) { byteLen = 0; }
    if (byteLen === 0) {
      return { statusCode: 400, body: 'Invalid base64 content' };
    }
    if (byteLen > 8 * 1024 * 1024) {
      return { statusCode: 413, body: 'Payload too large (max 8MB)' };
    }

    const headers = {
      'Content-Type': mime,
      'Content-Disposition': contentDisposition(filename),
      'Cache-Control': 'no-store',
      'Content-Length': String(byteLen),
    };
    if (token) {
      headers['Set-Cookie'] = `download_ok_${encodeURIComponent(token)}=1; Max-Age=300; Path=/; SameSite=Lax`;
    }

    return {
      statusCode: 200,
      headers,
      isBase64Encoded: true,
      body: contentBase64,
    };
  } catch (err) {
    return { statusCode: 500, body: 'Server Error' };
  }
};

function contentDisposition(filename) {
  const fallback = filename.replace(/[\r\n"%]/g, '_');
  const encoded = encodeRFC5987ValueChars(filename);
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

function encodeRFC5987ValueChars(str) {
  return encodeURIComponent(str)
    .replace(/['()]/g, escape) // i.e., %27 %28 %29
    .replace(/\*/g, '%2A')
    .replace(/%(7C|60|5E)/g, '%25$1');
}
