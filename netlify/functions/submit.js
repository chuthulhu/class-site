// class-site/netlify/functions/submit.js
// ESM (package.json: { "type": "module" })
// Delegated OAuth (선생님 계정) + Microsoft Graph → OneDrive 업로드
// - 단일/다중 파일 모두 지원
// - 정책 검증(확장자/용량/총합/간이 스니핑)
// - ≤10MB: 단일 PUT / >10MB: createUploadSession(청크 8MiB)

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Submission-Key",
  "Access-Control-Allow-Methods": "OPTIONS, POST",
};

// 정책(형식별 최대 용량 MB)
const EXT_LIMIT_MB = {
  pdf:20, html:5, htm:5, jpg:8, jpeg:8, png:8, csv:2, txt:2,
  zip:50, hwp:10, hwpx:10, ppt:40, pptx:40, xlsx:5, mp4:300
};
const ALLOWED_EXT = new Set(Object.keys(EXT_LIMIT_MB));
const MAX_FILES_PER_SUBMISSION = 5;
const TOTAL_SUM_LIMIT_MB = 300;

const SINGLE_PUT_THRESHOLD = 10 * 1024 * 1024; // 10MB
const CHUNK_SIZE = 8 * 1024 * 1024;            // 8MiB 권장

exports.handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 200, headers: CORS_HEADERS, body: "" };
    }
    if (event.httpMethod !== "POST") {
      return withCors(405, { ok:false, error: "method not allowed" });
    }

    // 1) 인증 키
    const clientKey = event.headers["x-submission-key"] || event.headers["X-Submission-Key"];
    const serverKey = process.env.SUBMIT_KEY;
    if (!serverKey) return withCors(500, { ok:false, error: "server misconfigured: SUBMIT_KEY not set" });
    if (!clientKey || clientKey !== serverKey) return withCors(401, { ok:false, error: "unauthorized" });

    // 2) 환경변수
    const {
      MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, MS_REFRESH_TOKEN,
      ROOT_FOLDER_PATH = "/과제제출",
    } = process.env;
    for (const [k, v] of Object.entries({ MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, MS_REFRESH_TOKEN })) {
      if (!v) return withCors(500, { ok:false, error: `server misconfigured: ${k} not set` });
    }

    // 3) 본문 파싱
    if (!event.body) return withCors(400, { ok:false, error: "missing fields" });
    let payload;
    try { payload = JSON.parse(event.body); } catch { return withCors(400, { ok:false, error: "invalid json" }); }

    const { studentId, subject, activity, section } = payload || {};
    if (!studentId || !subject || !activity || !section) {
      return withCors(400, { ok:false, error: "missing fields (studentId/subject/activity/section)" });
    }

    // 4) 단일/다중 통일
    const files = normalizeToArray(payload);
    if (files.length === 0) return withCors(400, { ok:false, error: "no files" });
    if (files.length > MAX_FILES_PER_SUBMISSION) {
      return withCors(400, { ok:false, error: "too many files", detail: `max ${MAX_FILES_PER_SUBMISSION} files allowed` });
    }

    // 5) base64→Buffer, 확장자/용량/스니핑 검증 + 총합
    let totalBytes = 0;
    const enriched = [];
    for (const [idx, f] of files.entries()) {
      if (!f?.filename || !f?.contentBase64) {
        return withCors(400, { ok:false, error: "missing file fields", detail: `index ${idx}` });
      }
      const ext = getExt(f.filename);
      if (!ALLOWED_EXT.has(ext)) {
        return withCors(400, { ok:false, error: "unsupported file type", detail: `${f.filename}` });
      }

      let buf;
      try { buf = Buffer.from(f.contentBase64, "base64"); }
      catch { return withCors(400, { ok:false, error: "invalid base64", detail: `${f.filename}` }); }
      if (!buf.length) return withCors(400, { ok:false, error: "empty file", detail: `${f.filename}` });

      if (!checkSizeLimit(ext, buf.length)) {
        return withCors(400, { ok:false, error: "file too large", detail: `${ext} max ${EXT_LIMIT_MB[ext]}MB` });
      }
      // 간이 매직넘버 스니핑(가능한 형식만)
      if (!sniffMagic(ext, buf)) {
        return withCors(415, { ok:false, error: "content mismatch", detail: `${f.filename} (${ext})` });
      }

      totalBytes += buf.length;
      enriched.push({ filename: f.filename, mime: f.mime, buffer: buf, ext });
    }
    if (totalBytes > TOTAL_SUM_LIMIT_MB * 1024 * 1024) {
      return withCors(400, { ok:false, error: "total size exceeded", detail: `max ${TOTAL_SUM_LIMIT_MB}MB per submission` });
    }

    // 6) Access Token
    const accessToken = await getMsAccessToken({
      tenantId: MS_TENANT_ID,
      clientId: MS_CLIENT_ID,
      clientSecret: MS_CLIENT_SECRET,
      refreshToken: MS_REFRESH_TOKEN,
      scope: "offline_access Files.ReadWrite openid profile User.Read",
    });

    // 7) 경로/폴더 보장
    const rootPath = normalizeRoot(ROOT_FOLDER_PATH); // "/과제제출" → "과제제출"
    const parentPath = [rootPath, subject, activity, section, String(studentId)].join("/");
    await ensureFolderTree(accessToken, parentPath);

    // 8) 파일별 업로드(중복 시 타임스탬프)
    const results = [];
    for (const file of enriched) {
      const safeName = sanitizeFileName(file.filename);
      const exists = await itemExists(accessToken, `${parentPath}/${safeName}`);
      const finalName = exists ? appendTimestamp(safeName) : safeName;
      const fullPath = `${parentPath}/${finalName}`;

      const uploaded = (file.buffer.length <= SINGLE_PUT_THRESHOLD)
        ? await putFileContent(accessToken, fullPath, file.buffer)
        : await uploadLargeFile(accessToken, fullPath, file.buffer);

      results.push({
        name: uploaded?.name ?? finalName,
        size: file.buffer.length,
        webUrl: uploaded?.webUrl ?? null,
        chunked: file.buffer.length > SINGLE_PUT_THRESHOLD,
      });
    }

    // 9) 응답
    return withCors(200, {
      ok: true,
      studentId, subject, activity, section,
      submittedAt: new Date().toISOString(),
      files: results,
    });
  } catch (err) {
    console.error(err);
    return withCors(500, { ok:false, error: "internal error" });
  }
};

/* ============ 유틸/검증 ============ */

function withCors(statusCode, bodyObj) {
  return { statusCode, headers: { "Content-Type": "application/json", ...CORS_HEADERS }, body: JSON.stringify(bodyObj) };
}
function normalizeToArray(payload) {
  if (Array.isArray(payload?.files) && payload.files.length) return payload.files;
  if (payload?.filename && payload?.contentBase64) {
    return [{ filename: payload.filename, contentBase64: payload.contentBase64, mime: payload.mime }];
  }
  return [];
}
function getExt(name) {
  const m = /\.([^.]+)$/.exec(name || "");
  return m ? m[1].toLowerCase() : "";
}
function sanitizeFileName(name) {
  return String(name).replace(/[\/\\\u0000-\u001F\u007F]/g, "_");
}
function normalizeRoot(p) {
  if (!p) return "과제제출";
  return p.replace(/^\/+/, "").replace(/\/+$/, "");
}
function checkSizeLimit(ext, sizeBytes) {
  const mb = EXT_LIMIT_MB[ext];
  return !!mb && sizeBytes <= mb * 1024 * 1024;
}
function sniffMagic(ext, buf) {
  try {
    const head = buf.subarray(0, 12);
    const asStr = head.toString("utf8");
    if (ext === "pdf")   return asStr.startsWith("%PDF-");
    if (ext === "jpg" || ext === "jpeg") return head[0]===0xFF && head[1]===0xD8 && head[2]===0xFF;
    if (ext === "png")   return head[0]===0x89 && asStr.startsWith("\x89PNG");
    if (ext === "zip" || ext==="pptx" || ext==="xlsx" || ext==="hwpx") return head[0]===0x50 && head[1]===0x4B; // 'PK'
    if (ext === "mp4")   return buf.subarray(0, 1024).toString("utf8").includes("ftyp");
    // hwp/html/csv/txt/ppt 등은 스니핑 생략(확장자/용량 검증만)
    return true;
  } catch { return true; }
}
function appendTimestamp(name) {
  const idx = name.lastIndexOf(".");
  const d = new Date();
  const yyyy = d.getFullYear().toString();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const MM = String(d.getMinutes()).padStart(2, "0");
  const SS = String(d.getSeconds()).padStart(2, "0");
  const ts = `${yyyy}${mm}${dd}_${HH}${MM}${SS}`;
  if (idx > 0) return `${name.slice(0, idx)}_${ts}${name.slice(idx)}`;
  return `${name}_${ts}`;
}

/* ============ Graph 호출 ============ */

async function getMsAccessToken({ tenantId, clientId, clientSecret, refreshToken, scope }) {
  const url = `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`;
  const form = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    scope,
  });
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`token exchange failed: ${resp.status} ${text}`);
  }
  const data = await resp.json();
  if (!data.access_token) throw new Error("no access_token in token response");
  return data.access_token;
}
function encodePathForColonAddressing(path) {
  return path.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}
async function ensureFolderTree(accessToken, path) {
  const parts = path.split("/").filter(Boolean);
  let curr = "";
  for (const seg of parts) {
    const next = curr ? `${curr}/${seg}` : seg;

    const enc = encodePathForColonAddressing(next);
    const getUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${enc}`;
    const g = await fetch(getUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (g.status === 404) {
      const parentEnc = encodePathForColonAddressing(curr || "");
      const createUrl = curr
        ? `https://graph.microsoft.com/v1.0/me/drive/root:/${parentEnc}:/children`
        : `https://graph.microsoft.com/v1.0/me/drive/root/children`;
      const body = { name: seg, folder: {}, "@microsoft.graph.conflictBehavior": "rename" };
      const c = await fetch(createUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!c.ok) {
        const t = await c.text().catch(() => "");
        throw new Error(`failed to create folder: ${next} (${c.status}) ${t}`);
      }
    } else if (!g.ok) {
      const t = await g.text().catch(() => "");
      throw new Error(`folder check failed: ${next} (${g.status}) ${t}`);
    }
    curr = next;
  }
}
async function itemExists(accessToken, fullPath) {
  const enc = encodePathForColonAddressing(fullPath);
  const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${enc}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (r.status === 404) return false;
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`exists check failed: ${r.status} ${t}`);
  }
  return true;
}
async function putFileContent(accessToken, fullPath, buffer) {
  const enc = encodePathForColonAddressing(fullPath);
  const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${enc}:/content`;
  const resp = await fetch(url, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/octet-stream" },
    body: buffer,
  });
  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    throw new Error(`upload failed: ${resp.status} ${t}`);
  }
  return await resp.json();
}
async function uploadLargeFile(accessToken, fullPath, buffer) {
  const enc = encodePathForColonAddressing(fullPath);
  const createUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${enc}:/createUploadSession`;
  const createBody = { item: { "@microsoft.graph.conflictBehavior": "fail" } };
  const createResp = await fetch(createUrl, {
    method: "POST",
    headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(createBody),
  });
  if (!createResp.ok) {
    const t = await createResp.text().catch(() => "");
    throw new Error(`createUploadSession failed: ${createResp.status} ${t}`);
  }
  const { uploadUrl } = await createResp.json();
  if (!uploadUrl) throw new Error("no uploadUrl in createUploadSession");

  const total = buffer.length;
  let start = 0, attempt = 0;

  while (start < total) {
    const end = Math.min(start + CHUNK_SIZE, total);
    const chunk = buffer.subarray(start, end);
    const contentRange = `bytes ${start}-${end - 1}/${total}`;

    const r = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Length": String(chunk.length), "Content-Range": contentRange },
      body: chunk,
    });

    if (r.status === 202) { // 진행 중
      start = end; attempt = 0; continue;
    }
    if (r.ok) {
      try { return await r.json(); }
      catch {
        const enc2 = encodePathForColonAddressing(fullPath);
        const getUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${enc2}`;
        const g = await fetch(getUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
        return await g.json();
      }
    }

    attempt++;
    if (attempt > 3) {
      const t = await r.text().catch(() => "");
      throw new Error(`chunk upload failed: ${r.status} ${t}`);
    }
    await wait(300 * attempt); // 0.3s, 0.6s, 0.9s
  }
  throw new Error("upload loop ended unexpectedly");
}
function wait(ms) { return new Promise((res) => setTimeout(res, ms)); }
