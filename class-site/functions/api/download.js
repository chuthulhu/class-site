// Cloudflare Pages Function: download
// Accepts POST with fields: filename, mime, contentBase64 (raw base64, no data URL)
// Returns the file as an attachment response (binary) for in-app browsers.

import { Buffer } from 'node:buffer';

export async function onRequest(context) {
  const { request } = context;

  try {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const ct = (request.headers.get('content-type') || '').toLowerCase();
    let fields = {};
    const bodyText = await request.text();

    if (ct.includes('application/json')) {
      fields = JSON.parse(bodyText || '{}');
    } else if (ct.includes('application/x-www-form-urlencoded')) {
      fields = Object.fromEntries((bodyText || '').split('&').map(pair => {
        const [k, v] = pair.split('=');
        return [decodeURIComponent(k || ''), decodeURIComponent((v || '').replace(/\+/g, ' '))];
      }));
    } else if (ct.startsWith('multipart/form-data')) {
      // Minimal parser for small forms; recommend x-www-form-urlencoded for large payloads.
      // Fallback: treat as raw body JSON if client sent JSON with wrong header.
      try { fields = JSON.parse(bodyText || '{}'); } catch (_) { fields = {}; }
    } else {
      // Try JSON, else fallback to urlencoded
      try { fields = JSON.parse(bodyText || '{}'); }
      catch (_) {
        fields = Object.fromEntries((bodyText || '').split('&').map(pair => {
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
      return new Response('contentBase64 is required', { status: 400 });
    }

    // Size guard (8 MiB)
    let byteLen = 0;
    let buffer;
    try { 
        buffer = Buffer.from(contentBase64, 'base64');
        byteLen = buffer.length; 
    } catch (_) { 
        byteLen = 0; 
    }
    
    if (byteLen === 0) {
      return new Response('Invalid base64 content', { status: 400 });
    }
    if (byteLen > 8 * 1024 * 1024) {
      return new Response('Payload too large (max 8MB)', { status: 413 });
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

    return new Response(buffer, {
      status: 200,
      headers
    });

  } catch (err) {
    return new Response('Server Error', { status: 500 });
  }
}

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
