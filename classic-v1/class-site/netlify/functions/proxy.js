// class-site/netlify/functions/proxy.js
// 외부 API 호출을 위한 프록시 서버
// CORS 문제를 완전히 해결

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400" // 24시간 캐시
};

// 허용된 외부 API 목록
const ALLOWED_APIS = {
  'onedrive': 'https://graph.microsoft.com',
  'google-drive': 'https://www.googleapis.com',
  'dropbox': 'https://api.dropboxapi.com',
  'webhook': 'https://hooks.slack.com'
};

export const handler = async (event) => {
  try {
    // OPTIONS 요청 처리 (Preflight)
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: ""
      };
    }

    // 요청 파라미터 파싱
    const { api, endpoint, method = 'GET', headers = {}, body } = JSON.parse(event.body || '{}');
    
    // API 검증
    if (!api || !ALLOWED_APIS[api]) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ 
          error: "Invalid API", 
          allowed: Object.keys(ALLOWED_APIS) 
        })
      };
    }

    // 프록시 요청 구성
    const baseUrl = ALLOWED_APIS[api];
    const targetUrl = `${baseUrl}${endpoint}`;
    
    const proxyHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    // 외부 API 호출
    const response = await fetch(targetUrl, {
      method: method.toUpperCase(),
      headers: proxyHeaders,
      body: body ? JSON.stringify(body) : undefined
    });

    const responseData = await response.text();
    
    return {
      statusCode: response.status,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': response.headers.get('content-type') || 'application/json'
      },
      body: responseData
    };

  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message })
    };
  }
};



