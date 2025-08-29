// class-site/netlify/functions/submit.js
// ESM (package.json: { "type": "module" })
// Delegated OAuth (선생님 계정) + Microsoft Graph → OneDrive 업로드
// - ≤10MB: 단일 PUT
// - >10MB: createUploadSession + 청크 업로드(8MiB)

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Submission-Key",
  "Access-Control-Allow-Methods": "OPTIONS, POST",
};

// 파일 정책
const MAX_SIZE = 250 * 1024 * 1024;         // 안전 상한(필요 시 조정)
const SINGLE_PUT_THRESHOLD = 10 * 1024 * 1024; // 10MB 초과 시 세션 전환
const CHUNK_SIZE = 8 * 1024 * 1024;         // 8MiB 권장
const ALLOWED_EXT = /\.(zip|pdf|html?|htm)$/i;

export const handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 200, headers: CORS_HEADERS, body: "" };
    }
    if (event.httpMethod !== "POST") {
      return withCors(405, { error: "method not allowed" });
    }

    // 1) 인증 키
    const clientKey = event.headers["x-submission-key"] || event.headers["X-Submission-Key"];
    const serverKey = process.env.SUBMIT_KEY;
    if (!serverKey) return withCors(500, { error: "server misconfigured: SUBMIT_KEY not set" });
    if (!clientKey || clientKey !== serverKey) return withCors(401, { error: "unauthorized" });

    // 2) 환경변수
    const {
      MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, MS_REFRESH_TOKEN,
      ROOT_FOLDER_PATH = "/과제제출",
    } = process.env;
    for (const [k, v] of Object.entries({ MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, MS_REFRESH_TOKEN })) {
      if (!v) return withCors(500, { error: `server misconfigured: ${k} not set` });
    }

    // 3) 본문 파싱/검증
    if (!event.body) return withCors(400, { error: "missing fields" });
    let payload;
    try { payload = JSON.parse(event.body); } catch { return withCors(400, { error: "invalid json" }); }
    const { studentId, subject, section, filename, contentBase64 } = payload || {};
    if (!studentId || !subject || !section || !filename || !contentBase64) {
      return withCors(400, { error: "missing fields" });
    }
    if (!ALLOWED_EXT.test(filename)) return withCors(400, { error: "unsupported file type" });

    let fileBuf;
    try { fileBuf = Buffer.from(contentBase64, "base64"); } catch { return withCors(400, { error: "invalid base64" }); }
    if (!fileBuf.length) return withCors(400, { error: "empty file" });
    if (fileBuf.length > MAX_SIZE) return withCors(400, { error: `file too large (max ${Math.floor(MAX_SIZE/1024/1024)}MB)` });

    // 4) Access Token (Refresh Token 교환)
    const accessToken = await getMsAccessToken({
      tenantId: MS_TENANT_ID,
      clientId: MS_CLIENT_ID,
      clientSecret: MS_CLIENT_SECRET,
      refreshToken: MS_REFRESH_TOKEN,
      scope: "offline_access Files.ReadWrite openid profile User.Read",
    });

    // 5) 경로/파일명
    const safeName = sanitizeFileName(filename);      // 한글/공백 유지, 경로문자 제거
    const rootPath = normalizeRoot(ROOT_FOLDER_PATH); // "/과제제출" -> "과제제출"
    const parentPath = [rootPath, subject, section, String(studentId)].join("/");

    // 6) 폴더 보장
    await ensureFolderTree(accessToken, parentPath);

    // 7) 중복 처리
    const exists = await itemExists(accessToken, `${parentPath}/${safeName}`);
    const finalName = exists ? appendTimestamp(safeName) : safeName;
    const fullPath = `${parentPath}/${finalName}`;

    // 8) 업로드 분기
    let result;
    if (fileBuf.length <= SINGLE_PUT_THRESHOLD) {
      result = await putFileContent(accessToken, fullPath, fileBuf);
    } else {
      result = await uploadLargeFile(accessToken, fullPath, fileBuf);
    }

    return withCors(200, {
      ok: true,
      id: result?.id,
      name: result?.name,
      webUrl: result?.webUrl,
      subject, section, studentId,
      size: fileBuf.length,
      uploadedBy: "me/drive", // 명시적
      chunked: fileBuf.length > SINGLE_PUT_THRESHOLD,
    });
  } catch (err) {
    console.error(err);
    return withCors(500, { error: "internal error" });
  }
};

/* ===================== Utilities ===================== */

function withCors(statusCode, bodyObj) {
  return { statusCode, headers: { "Content-Type": "application/json", ...CORS_HEADERS }, body: JSON.stringify(bodyObj) };
}

function sanitizeFileName(name) {
  return name.replace(/[\/\\\u0000-\u001F\u007F]/g, "_");
}
function normalizeRoot(p) {
  if (!p) return "과제제출";
  return p.replace(/^\/+/, "").replace(/\/+$/, "");
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

    // 존재 확인
    const enc = encodePathForColonAddressing(next);
    const getUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${enc}`;
    const g = await fetch(getUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (g.status === 404) {
      // 생성
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

/* ============ 대용량 업로드(업로드 세션) ============ */

async function uploadLargeFile(accessToken, fullPath, buffer) {
  // 1) 세션 생성
  const enc = encodePathForColonAddressing(fullPath);
  const createUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${enc}:/createUploadSession`;
  const createBody = {
    item: {
      "@microsoft.graph.conflictBehavior": "fail" // 중복은 이미 finalName에서 해결했으므로 여기선 fail
    }
  };
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

  // 2) 청크 업로드 루프
  const total = buffer.length;
  let start = 0;
  let attempt = 0;

  while (start < total) {
    const end = Math.min(start + CHUNK_SIZE, total);
    const chunk = buffer.subarray(start, end);
    const contentRange = `bytes ${start}-${end - 1}/${total}`;

    const r = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Length": String(chunk.length),
        "Content-Range": contentRange,
      },
      body: chunk,
    });

    if (r.status === 202) {
      // 진행 중: nextExpectedRanges 참고 가능(여기서는 순차 업로드라 start+=CHUNK_SIZE)
      start = end;
      attempt = 0; // 진행되면 재시도 카운터 리셋
      continue;
    }

    if (r.ok) {
      // 완료(200/201/204) → DriveItem 반환(200/201)
      try {
        const item = await r.json();
        return item;
      } catch {
        // 일부 응답은 본문이 없을 수 있음 → 최종 GET으로 보강
        const headOk = await itemExists(accessToken, fullPath);
        if (headOk) {
          const enc2 = encodePathForColonAddressing(fullPath);
          const getUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${enc2}`;
          const g = await fetch(getUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
          return await g.json();
        }
        throw new Error("upload session completed but item not found");
      }
    }

    // 오류 → 간단 재시도(지수 백오프)
    attempt++;
    if (attempt > 3) {
      const t = await r.text().catch(() => "");
      throw new Error(`chunk upload failed: ${r.status} ${t}`);
    }
    await wait(300 * attempt); // 0.3s, 0.6s, 0.9s
  }

  throw new Error("upload loop ended unexpectedly");
}

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
