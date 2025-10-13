// class-site/netlify/functions/submit_test.js
// 테스트용 서버리스 함수 - Phase 1 & Phase 2 개선사항 포함
// ESM (package.json: { "type": "module" })
// Delegated OAuth (선생님 계정) + Microsoft Graph → OneDrive 업로드
// - 단일/다중 파일 모두 지원
// - 정책 검증(확장자/용량/총합/간이 스니핑)
// - ≤10MB: 단일 PUT / >10MB: createUploadSession(동적 청크 크기)

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
const DEFAULT_CHUNK_SIZE = 8 * 1024 * 1024;    // 8MiB 기본값
const MIN_CHUNK_SIZE = 1024 * 1024;            // 1MB 최소값
const MAX_CHUNK_SIZE = 16 * 1024 * 1024;       // 16MB 최대값

// 동적 청크 크기 계산 함수
function calculateOptimalChunkSize(fileSize) {
  // 파일 크기에 따른 최적 청크 크기 계산
  if (fileSize <= 50 * 1024 * 1024) { // 50MB 이하
    return Math.max(MIN_CHUNK_SIZE, Math.min(4 * 1024 * 1024, fileSize / 10));
  } else if (fileSize <= 200 * 1024 * 1024) { // 200MB 이하
    return Math.max(4 * 1024 * 1024, Math.min(8 * 1024 * 1024, fileSize / 15));
  } else { // 200MB 초과
    return Math.max(8 * 1024 * 1024, Math.min(MAX_CHUNK_SIZE, fileSize / 20));
  }
}

// 환경변수 검증
const requiredEnvVars = [
  'SUBMIT_KEY', 'MS_TENANT_ID', 'MS_CLIENT_ID',
  'MS_CLIENT_SECRET', 'MS_REFRESH_TOKEN'
];

// 구조화된 로깅 함수
function logError(error, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    error: error.message || error,
    context: {
      ...context,
      userAgent: context.userAgent || 'unknown',
      ip: context.ip || 'unknown'
    },
    stack: error.stack || 'No stack trace available'
  };
  console.error(JSON.stringify(logEntry));
}

function logSuccess(message, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message,
    context: {
      ...context,
      userAgent: context.userAgent || 'unknown',
      ip: context.ip || 'unknown'
    }
  };
  console.log(JSON.stringify(logEntry));
}

// 표준화된 오류 응답 생성
function createErrorResponse(statusCode, error, detail = null) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS
    },
    body: JSON.stringify({ ok: false, error, detail })
  };
}

export const handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 200, headers: CORS_HEADERS, body: "" };
    }

    // 환경변수 검증
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        logError(new Error(`Missing environment variable: ${envVar}`), {
          context: 'env_validation',
          missingVar: envVar,
          timestamp: new Date().toISOString()
        });
        return createErrorResponse(500, 'server misconfigured', `Missing environment variable: ${envVar}`);
      }
    }
    if (event.httpMethod !== "POST") {
      return withCors(405, { ok:false, error: "method not allowed" });
    }

    // 1) 인증 키 검증
    const clientKey = event.headers["x-submission-key"] || event.headers["X-Submission-Key"];
    const serverKey = process.env.SUBMIT_KEY;
    if (!clientKey) {
      logError(new Error('Missing X-Submission-Key header'), {
        context: 'auth_validation',
        userAgent: event.headers['user-agent'] || 'unknown',
        ip: event.headers['x-forwarded-for'] || 'unknown',
        timestamp: new Date().toISOString()
      });
      return createErrorResponse(401, 'unauthorized', 'Missing X-Submission-Key header');
    }
    if (clientKey !== serverKey) {
      logError(new Error('Invalid submission key'), {
        context: 'auth_validation',
        userAgent: event.headers['user-agent'] || 'unknown',
        ip: event.headers['x-forwarded-for'] || 'unknown',
        providedKey: clientKey.substring(0, 8) + '...', // 보안을 위해 일부만 로깅
        timestamp: new Date().toISOString()
      });
      return createErrorResponse(401, 'unauthorized', 'Invalid submission key');
    }

    // 2) 환경변수
    const {
      MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, MS_REFRESH_TOKEN,
      ROOT_FOLDER_PATH = "/과제제출",
    } = process.env;
    for (const [k, v] of Object.entries({ MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, MS_REFRESH_TOKEN })) {
      if (!v) return withCors(500, { ok:false, error: `server misconfigured: ${k} not set` });
    }

    // 3) 본문 파싱
    if (!event.body) {
      logError(new Error('Missing request body'), {
        context: 'payload_validation',
        userAgent: event.headers['user-agent'] || 'unknown',
        ip: event.headers['x-forwarded-for'] || 'unknown',
        timestamp: new Date().toISOString()
      });
      return createErrorResponse(400, 'missing body', 'Request body is required');
    }
    
    let payload;
    try { 
      payload = JSON.parse(event.body); 
    } catch (parseError) {
      logError(new Error('Invalid JSON in request body'), {
        context: 'payload_validation',
        error: parseError.message,
        userAgent: event.headers['user-agent'] || 'unknown',
        ip: event.headers['x-forwarded-for'] || 'unknown',
        timestamp: new Date().toISOString()
      });
      return createErrorResponse(400, 'invalid json', 'Request body must be valid JSON');
    }

    const { studentId, subject, activity, section } = payload || {};
    if (!studentId || !subject || !activity || !section) {
      logError(new Error('Missing required fields'), {
        context: 'payload_validation',
        missingFields: { studentId: !!studentId, subject: !!subject, activity: !!activity, section: !!section },
        userAgent: event.headers['user-agent'] || 'unknown',
        ip: event.headers['x-forwarded-for'] || 'unknown',
        timestamp: new Date().toISOString()
      });
      return createErrorResponse(400, 'missing fields', 'studentId, subject, activity, and section are required');
    }

    // 4) 단일/다중 통일
    const files = normalizeToArray(payload);
    if (files.length === 0) {
      logError(new Error('No files provided'), {
        context: 'file_validation',
        userAgent: event.headers['user-agent'] || 'unknown',
        ip: event.headers['x-forwarded-for'] || 'unknown',
        timestamp: new Date().toISOString()
      });
      return createErrorResponse(400, 'no files', 'At least one file is required');
    }
    if (files.length > MAX_FILES_PER_SUBMISSION) {
      logError(new Error('Too many files'), {
        context: 'file_validation',
        fileCount: files.length,
        maxAllowed: MAX_FILES_PER_SUBMISSION,
        userAgent: event.headers['user-agent'] || 'unknown',
        ip: event.headers['x-forwarded-for'] || 'unknown',
        timestamp: new Date().toISOString()
      });
      return createErrorResponse(400, 'too many files', `Maximum ${MAX_FILES_PER_SUBMISSION} files allowed`);
    }

    // 5) base64→Buffer, 확장자/용량/스니핑 검증 + 총합
    let totalBytes = 0;
    const enriched = [];
    for (const [idx, f] of files.entries()) {
      if (!f?.filename || !f?.contentBase64) {
        logError(new Error('Missing file fields'), {
          context: 'file_validation',
          fileIndex: idx,
          filename: f?.filename || 'unknown',
          userAgent: event.headers['user-agent'] || 'unknown',
          ip: event.headers['x-forwarded-for'] || 'unknown',
          timestamp: new Date().toISOString()
        });
        return createErrorResponse(400, 'missing file fields', `File at index ${idx} is missing required fields`);
      }
      
      const ext = getExt(f.filename);
      if (!ALLOWED_EXT.has(ext)) {
        logError(new Error('Unsupported file type'), {
          context: 'file_validation',
          filename: f.filename,
          extension: ext,
          allowedExtensions: Array.from(ALLOWED_EXT),
          userAgent: event.headers['user-agent'] || 'unknown',
          ip: event.headers['x-forwarded-for'] || 'unknown',
          timestamp: new Date().toISOString()
        });
        return createErrorResponse(400, 'unsupported file type', `File type .${ext} is not supported`);
      }

      let buf;
      try { 
        buf = Buffer.from(f.contentBase64, "base64"); 
      } catch (base64Error) {
        logError(new Error('Invalid base64 encoding'), {
          context: 'file_validation',
          filename: f.filename,
          error: base64Error.message,
          userAgent: event.headers['user-agent'] || 'unknown',
          ip: event.headers['x-forwarded-for'] || 'unknown',
          timestamp: new Date().toISOString()
        });
        return createErrorResponse(400, 'invalid base64', `Invalid base64 encoding for file: ${f.filename}`);
      }
      
      if (!buf.length) {
        logError(new Error('Empty file'), {
          context: 'file_validation',
          filename: f.filename,
          userAgent: event.headers['user-agent'] || 'unknown',
          ip: event.headers['x-forwarded-for'] || 'unknown',
          timestamp: new Date().toISOString()
        });
        return createErrorResponse(400, 'empty file', `File ${f.filename} is empty`);
      }
      
      if (!checkSizeLimit(ext, buf.length)) {
        logError(new Error('File too large'), {
          context: 'file_validation',
          filename: f.filename,
          extension: ext,
          fileSize: buf.length,
          maxSize: EXT_LIMIT_MB[ext] * 1024 * 1024,
          userAgent: event.headers['user-agent'] || 'unknown',
          ip: event.headers['x-forwarded-for'] || 'unknown',
          timestamp: new Date().toISOString()
        });
        return createErrorResponse(400, 'file too large', `File ${f.filename} exceeds maximum size of ${EXT_LIMIT_MB[ext]}MB`);
      }
      
      // 간이 매직넘버 스니핑(가능한 형식만)
      if (!sniffMagic(ext, buf)) {
        logError(new Error('Content type mismatch'), {
          context: 'file_validation',
          filename: f.filename,
          extension: ext,
          userAgent: event.headers['user-agent'] || 'unknown',
          ip: event.headers['x-forwarded-for'] || 'unknown',
          timestamp: new Date().toISOString()
        });
        return createErrorResponse(415, 'content mismatch', `File content does not match extension: ${f.filename}`);
      }

      totalBytes += buf.length;
      enriched.push({ filename: f.filename, mime: f.mime, buffer: buf, ext });
      
      logSuccess(`File validation successful`, {
        context: 'file_validation',
        filename: f.filename,
        extension: ext,
        fileSize: buf.length,
        userAgent: event.headers['user-agent'] || 'unknown',
        ip: event.headers['x-forwarded-for'] || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
    if (totalBytes > TOTAL_SUM_LIMIT_MB * 1024 * 1024) {
      logError(new Error('Total size exceeded'), {
        context: 'file_validation',
        totalSize: totalBytes,
        maxSize: TOTAL_SUM_LIMIT_MB * 1024 * 1024,
        userAgent: event.headers['user-agent'] || 'unknown',
        ip: event.headers['x-forwarded-for'] || 'unknown',
        timestamp: new Date().toISOString()
      });
      return createErrorResponse(400, 'total size exceeded', `Maximum ${TOTAL_SUM_LIMIT_MB}MB per submission`);
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

    // 성공 로깅
    logSuccess('Upload completed successfully', {
      context: 'upload_success',
      studentId,
      subject,
      activity,
      section,
      fileCount: results.length,
      totalSize: totalBytes,
      chunkedUploads: results.filter(r => r.chunked).length,
      userAgent: event.headers['user-agent'] || 'unknown',
      ip: event.headers['x-forwarded-for'] || 'unknown',
      timestamp: new Date().toISOString()
    });

    // 9) 응답
    return withCors(200, {
      ok: true,
      studentId, subject, activity, section,
      submittedAt: new Date().toISOString(),
      files: results,
    });
  } catch (err) {
    logError(err, {
      context: 'handler_error',
      userAgent: event.headers['user-agent'] || 'unknown',
      ip: event.headers['x-forwarded-for'] || 'unknown',
      timestamp: new Date().toISOString()
    });
    return createErrorResponse(500, 'internal error', 'An unexpected error occurred');
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
    if (buf.length < 4) return false; // 최소 헤더 크기 확인

    const head = buf.subarray(0, Math.min(1024, buf.length)); // 더 많은 바이트 확인
    const asStr = head.toString("utf8");

    // PDF 검증 강화
    if (ext === "pdf") {
      return asStr.startsWith("%PDF-") && asStr.includes("obj");
    }

    // JPEG 검증 강화
    if (ext === "jpg" || ext === "jpeg") {
      return head[0] === 0xFF && head[1] === 0xD8 && head[2] === 0xFF &&
             (head[3] === 0xE0 || head[3] === 0xE1 || head[3] === 0xDB);
    }

    // PNG 검증 강화
    if (ext === "png") {
      return head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4E && head[3] === 0x47 &&
             head[4] === 0x0D && head[5] === 0x0A && head[6] === 0x1A && head[7] === 0x0A;
    }

    // ZIP 계열 검증 강화 (ZIP, PPTX, XLSX, HWPX)
    if (ext === "zip" || ext === "pptx" || ext === "xlsx" || ext === "hwpx") {
      return head[0] === 0x50 && head[1] === 0x4B &&
             (head[2] === 0x03 || head[2] === 0x05 || head[2] === 0x07);
    }

    // MP4 검증 강화
    if (ext === "mp4") {
      return asStr.includes("ftyp") && (asStr.includes("mp41") || asStr.includes("mp42"));
    }

    // HTML 검증 추가
    if (ext === "html" || ext === "htm") {
      const htmlContent = asStr.toLowerCase();
      return htmlContent.includes("<html") || htmlContent.includes("<!doctype");
    }

    // TXT/CSV는 기본적으로 허용 (텍스트 파일이므로)
    if (ext === "txt" || ext === "csv") {
      return true;
    }

    // HWP/PPT는 기본적으로 허용 (바이너리 형식이 복잡함)
    if (ext === "hwp" || ext === "ppt") {
      return true;
    }

    return false; // 알 수 없는 형식은 거부
  } catch (error) {
    logError(error, { context: 'magic_sniffing', ext, bufferSize: buf.length });
    return false; // 에러 시 안전하게 거부
  }
}

function sanitizeFileName(name) {
  const sanitized = String(name)
    .replace(/[\/\\\u0000-\u001F\u007F]/g, "_")  // 기본 제어문자
    .replace(/[<>:"|?*]/g, "_")                  // Windows 금지문자
    .replace(/\.{2,}/g, ".")                     // 연속된 점 제거
    .replace(/^\.+|\.+$/g, "")                   // 시작/끝 점 제거
    .replace(/\s+/g, "_")                       // 공백을 언더스코어로
    .substring(0, 255);                         // 파일명 길이 제한

  // 빈 문자열이나 점만 있는 경우 기본값 반환
  return sanitized || "unnamed_file";
}

function appendTimestamp(name) {
  const sanitizedName = sanitizeFileName(name);
  const idx = sanitizedName.lastIndexOf(".");
  const d = new Date();
  const yyyy = d.getFullYear().toString();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const MM = String(d.getMinutes()).padStart(2, "0");
  const SS = String(d.getSeconds()).padStart(2, "0");
  const ts = `${yyyy}${mm}${dd}_${HH}${MM}${SS}`;
  if (idx > 0) return `${sanitizedName.slice(0, idx)}_${ts}${sanitizedName.slice(idx)}`;
  return `${sanitizedName}_${ts}`;
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
  const chunkSize = calculateOptimalChunkSize(total);
  
  // 청크 크기 로깅
  logSuccess('Starting chunked upload', {
    context: 'chunked_upload_start',
    filePath: fullPath,
    totalSize: total,
    totalSizeMB: Math.round(total / 1024 / 1024 * 100) / 100,
    chunkSize: chunkSize,
    chunkSizeMB: Math.round(chunkSize / 1024 / 1024 * 100) / 100,
    estimatedChunks: Math.ceil(total / chunkSize),
    timestamp: new Date().toISOString()
  });

  let start = 0, attempt = 0, chunkCount = 0;

  while (start < total) {
    chunkCount++;
    const end = Math.min(start + chunkSize, total);
    const chunk = buffer.subarray(start, end);
    const contentRange = `bytes ${start}-${end - 1}/${total}`;

    // 청크 업로드 진행 로깅
    logSuccess(`Uploading chunk ${chunkCount}/${Math.ceil(total / chunkSize)}`, {
      context: 'chunk_upload_progress',
      filePath: fullPath,
      chunkNumber: chunkCount,
      totalChunks: Math.ceil(total / chunkSize),
      chunkSize: chunk.length,
      progress: Math.round((start / total) * 100),
      timestamp: new Date().toISOString()
    });

    const r = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Length": String(chunk.length), "Content-Range": contentRange },
      body: chunk,
    });

    if (r.status === 202) { // 진행 중
      start = end; attempt = 0; continue;
    }
    if (r.ok) {
      try { 
        logSuccess('Chunked upload completed successfully', {
          context: 'chunked_upload_success',
          filePath: fullPath,
          totalChunks: chunkCount,
          totalSize: total,
          timestamp: new Date().toISOString()
        });
        return await r.json(); 
      }
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
      logError(new Error(`Chunk upload failed after ${attempt} attempts`), {
        context: 'chunk_upload_failure',
        filePath: fullPath,
        chunkNumber: chunkCount,
        attempt: attempt,
        status: r.status,
        response: t,
        timestamp: new Date().toISOString()
      });
      throw new Error(`chunk upload failed: ${r.status} ${t}`);
    }
    
    // 지수 백오프 대기
    const waitTime = Math.min(300 * Math.pow(2, attempt - 1), 5000); // 최대 5초
    logError(new Error(`Chunk upload retry ${attempt}/3`), {
      context: 'chunk_upload_retry',
      filePath: fullPath,
      chunkNumber: chunkCount,
      attempt: attempt,
      waitTime: waitTime,
      timestamp: new Date().toISOString()
    });
    await wait(waitTime);
  }
  throw new Error("upload loop ended unexpectedly");
}
function wait(ms) { return new Promise((res) => setTimeout(res, ms)); }
