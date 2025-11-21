// class-site/netlify/functions/download_test.js
// 테스트용 다운로드 함수 - 기존 download.js와 동일하지만 테스트용

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS, POST",
};

export const handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 200, headers: CORS_HEADERS, body: "" };
    }

    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: CORS_HEADERS,
        body: JSON.stringify({ ok: false, error: "method not allowed" })
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ ok: false, error: "missing body" })
      };
    }

    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ ok: false, error: "invalid json" })
      };
    }

    const { filename, mime, contentBase64, token } = payload;
    if (!filename || !mime || !contentBase64) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ ok: false, error: "missing fields" })
      };
    }

    // Base64 디코딩
    let buffer;
    try {
      buffer = Buffer.from(contentBase64, 'base64');
    } catch {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ ok: false, error: "invalid base64" })
      };
    }

    // 다운로드 완료 쿠키 설정 (선택적)
    if (token) {
      const cookieValue = `download_ok_${encodeURIComponent(token)}=1; Path=/; Max-Age=60`;
      return {
        statusCode: 200,
        headers: {
          "Content-Type": mime,
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": buffer.length.toString(),
          "Set-Cookie": cookieValue,
          ...CORS_HEADERS
        },
        body: buffer.toString('base64'),
        isBase64Encoded: true
      };
    }

    // 일반 다운로드
    return {
      statusCode: 200,
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
        ...CORS_HEADERS
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true
    };

  } catch (err) {
    console.error('Download test error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: false, error: "internal error" })
    };
  }
};
