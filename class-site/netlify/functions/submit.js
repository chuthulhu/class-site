// netlify/functions/submit.js
// Google Drive 업로드 버전 (개인 드라이브 루트 폴더에 서비스 계정 초대 방식)
// 요구 환경변수:
//  - GOOGLE_APPLICATION_CREDENTIALS_JSON: 서비스 계정 JSON(Base64 인코딩 문자열)
//  - ROOT_FOLDER_ID: 개인 드라이브의 "과제제출" 루트 폴더 ID
//  - SUBMIT_KEY: 클라이언트가 보내는 X-Submission-Key 값
//  - (선택) LOG_LEVEL: debug|info (기본 info)

import { google } from 'googleapis';
import { Readable } from 'node:stream';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,X-Submission-Key',
  'Access-Control-Max-Age': '86400',
};

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();

function log(level, ...args) {
  const order = { debug: 0, info: 1, warn: 2, error: 3 };
  if (order[level] >= order[LOG_LEVEL]) console[level === 'debug' ? 'log' : level](...args);
}

function decodeServiceKey() {
  const keyBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!keyBase64) throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS_JSON');
  const json = Buffer.from(keyBase64, 'base64').toString('utf8');
  return JSON.parse(json);
}

function base64Size(b64) {
  const len = b64.length;
  const pad = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  return (len * 3) / 4 - pad;
}

function detectMime(filename) {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.zip')) return 'application/zip';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'text/html';
  return 'application/octet-stream';
}

function sanitizeFilenameKeepKorean(name) {
  // Drive는 대부분의 문자를 허용하지만 경로 구분자(슬래시) 등은 제거
  // 한글/영문/숫자/여러 기호 허용, 슬래시와 제어문자만 제거
  return name.replace(/[\u0000-\u001F\u007F/\\]+/g, '_');
}

function withTimestampIfNeeded(filename) {
  // 호출자는 중복임이 확인된 경우에만 이 함수를 사용
  const dot = filename.lastIndexOf('.');
  const ts = new Date();
  const yyyy = ts.getFullYear();
  const mm = String(ts.getMonth() + 1).padStart(2, '0');
  const dd = String(ts.getDate()).padStart(2, '0');
  const HH = String(ts.getHours()).padStart(2, '0');
  const MM = String(ts.getMinutes()).padStart(2, '0');
  const SS = String(ts.getSeconds()).padStart(2, '0');
  const stamp = `${yyyy}${mm}${dd}_${HH}${MM}${SS}`;
  if (dot > 0) {
    return `${filename.slice(0, dot)}_${stamp}${filename.slice(dot)}`;
  }
  return `${filename}_${stamp}`;
}

async function getDriveClient() {
  const key = decodeServiceKey();
  const scopes = ['https://www.googleapis.com/auth/drive'];
  const auth = new google.auth.JWT(key.client_email, null, key.private_key, scopes);
  await auth.authorize();
  const drive = google.drive({ version: 'v3', auth });
  return drive;
}

async function findOrCreateFolder(drive, parentId, name) {
  // name이 동일한 폴더가 parentId 하위에 있으면 재사용
  const q = [
    `name = '${name.replace(/'/g, "\\'")}'`,
    `'${parentId}' in parents`,
    `mimeType = 'application/vnd.google-apps.folder'`,
    'trashed = false',
  ].join(' and ');

  const list = await drive.files.list({ q, fields: 'files(id,name)', pageSize: 1 });
  if (list.data.files && list.data.files.length > 0) {
    return list.data.files[0].id;
  }
  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id,name,parents',
  });
  return created.data.id;
}

async function fileExists(drive, parentId, filename) {
  const q = [
    `name = '${filename.replace(/'/g, "\\'")}'`,
    `'${parentId}' in parents`,
    'trashed = false',
  ].join(' and ');
  const list = await drive.files.list({ q, fields: 'files(id,name)', pageSize: 1 });
  return (list.data.files && list.data.files.length > 0) ? list.data.files[0] : null;
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS };
  try {
    if (event.httpMethod !== 'POST') throw new Error('POST only');

    // 인증 키 확인
    const headerKey = event.headers['x-submission-key'] || event.headers['X-Submission-Key'];
    if (process.env.SUBMIT_KEY && headerKey !== process.env.SUBMIT_KEY) {
      return { statusCode: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' }, body: 'unauthorized' };
    }

    // 요청 본문 파싱
    const body = JSON.parse(event.body || '{}');
    const { studentId, name, filename, contentBase64, subject, section } = body;
    if (!studentId || !filename || !contentBase64) {
      return { statusCode: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' }, body: 'missing fields' };
    }

    // 크기 검증 (8MB 제한)
    const size = base64Size(contentBase64);
    if (size > MAX_SIZE_BYTES) {
      return { statusCode: 413, headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' }, body: `file too large: ${size} > ${MAX_SIZE_BYTES}` };
    }

    // 확장자 화이트리스트
    const lower = String(filename).toLowerCase();
    if (!(/\.(zip|pdf|html?|htm)$/i).test(lower)) {
      return { statusCode: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' }, body: 'unsupported file type' };
    }

    const drive = await getDriveClient();

    // 폴더 트리: ROOT/subject/section/studentId
    const ROOT = process.env.ROOT_FOLDER_ID;
    if (!ROOT) throw new Error('Missing ROOT_FOLDER_ID');

    const safeSubject = String(subject || 'subject').trim();
    const safeSection = String(section || '000').trim();
    const safeStudent = String(studentId).trim();

    const subjectId = await findOrCreateFolder(drive, ROOT, safeSubject);
    const sectionId = await findOrCreateFolder(drive, subjectId, safeSection);
    const studentFolderId = await findOrCreateFolder(drive, sectionId, safeStudent);

    // 파일명: 클라이언트 생성 그대로 사용 + 최소한의 sanitize
    let finalName = sanitizeFilenameKeepKorean(String(filename).trim());

    // 중복 검사 → 중복 시 타임스탬프 덧붙임
    const exist = await fileExists(drive, studentFolderId, finalName);
    if (exist) {
      finalName = withTimestampIfNeeded(finalName);
    }

    // 업로드(multipart)
    const buffer = Buffer.from(contentBase64, 'base64');
    const mimeType = detectMime(finalName);
    const stream = Readable.from(buffer);

    const created = await drive.files.create({
      requestBody: {
        name: finalName,
        parents: [studentFolderId],
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id,name,webViewLink,webContentLink,parents',
    });

    const file = created.data;

    // 응답(학생 UI/교사용 대시보드에서 활용 가능)
    const response = {
      ok: true,
      fileId: file.id,
      name: file.name,
      webViewLink: file.webViewLink || null,
      webContentLink: file.webContentLink || null,
      parents: file.parents || [],
      size,
      subject: safeSubject,
      section: safeSection,
      studentId: safeStudent,
    };

    log('info', '[submit] uploaded', {
      subject: safeSubject,
      section: safeSection,
      studentId: safeStudent,
      name: file.name,
      id: file.id,
      size,
    });

    return { statusCode: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }, body: JSON.stringify(response) };
  } catch (err) {
    log('error', '[submit] error', err);
    const message = (err && err.message) ? err.message : String(err);
    return { statusCode: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' }, body: message };
  }
}
