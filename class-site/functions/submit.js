// netlify/functions/submit.js

export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": "https://physichu.netlify.app", // 배포 도메인 고정 권장
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-Submission-Key"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  try {
    if (event.httpMethod !== "POST") throw new Error("POST only");

    // 인증키 확인
    const SUBMIT_KEY = process.env.SUBMIT_KEY;
    const reqKey = event.headers["x-submission-key"];
    if (SUBMIT_KEY && reqKey !== SUBMIT_KEY) {
      return { statusCode: 401, headers, body: "unauthorized" };
    }

    // 요청 본문 파싱
    const { studentId, name, filename, contentBase64, subject, section } =
      JSON.parse(event.body || "{}");

    if (!studentId || !filename || !contentBase64) {
      throw new Error("missing required fields (studentId, filename, contentBase64)");
    }

    // 파일 크기 제한 (8MB 예시)
    const MAX_BYTES = 8 * 1024 * 1024;
    const bytes = Math.floor((contentBase64.length * 3) / 4);
    if (bytes > MAX_BYTES) {
      throw new Error("file too large (>8MB)");
    }

    // 확장자 화이트리스트
    const allowExt = [".zip", ".html", ".htm", ".pdf"];
    const lower = filename.toLowerCase();
    if (!allowExt.some((ext) => lower.endsWith(ext))) {
      throw new Error("unsupported file type");
    }

    // 안전한 문자열로 변환
    const safe = (s) =>
      String(s || "")
        .replace(/[^\w.\-가-힣]/g, "_")
        .slice(0, 120);

    // 교과(subject), 반(section) 기본값 보정
    const subj = safe(subject || "general");
    const sect = safe(section || "000");

    // 최종 저장 경로: submissions/{subject}/{section}/{studentId}/타임스탬프-파일명
    const path = `submissions/${subj}/${sect}/${safe(studentId)}/${Date.now()}-${safe(
      filename
    )}`;

    // GitHub API 호출
    const owner = "chuthulhu";     // 주인님 계정
    const repo = "2025storage";    // 저장소 이름
    const token = process.env.GH_TOKEN;

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "netlify-function"
        },
        body: JSON.stringify({
          message: `submission: ${studentId} ${name || ""} -> ${filename}`,
          content: contentBase64,
          committer: { name: "Submit Bot", email: "noreply@example.com" }
        })
      }
    );

    if (!res.ok) {
      return { statusCode: res.status, headers, body: await res.text() };
    }
    const data = await res.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ path: data.content.path })
    };
  } catch (e) {
    return { statusCode: 400, headers, body: String(e) };
  }
}
