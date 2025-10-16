export default async (request, context) => {
  const url = new URL(request.url);
  
  // 교사키 검증
  const TEACHER_KEY = Deno.env.get('TEACHER_ACCESS_KEY') || '';
  const providedKey = url.searchParams.get('key') || '';
  const hasValidKey = TEACHER_KEY && providedKey && providedKey === TEACHER_KEY;
  
  // 교사키가 없거나 유효하지 않으면 404 페이지 반환
  if (!hasValidKey) {
    return new Response(`
      <!DOCTYPE html>
      <html lang="ko">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>404 - 페이지를 찾을 수 없습니다</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
      </head>
      <body style="font-family: 'Noto Sans KR', sans-serif; background-color: #f3f4f6;">
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
              <div style="text-align: center; background: white; padding: 3rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,.1);">
                  <h1 style="font-size: 4rem; font-weight: bold; color: #ef4444; margin-bottom: 1rem;">404</h1>
                  <h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 1rem;">페이지를 찾을 수 없습니다</h2>
                  <p style="color: #6b7280; margin-bottom: 2rem;">요청하신 페이지가 존재하지 않습니다.</p>
                  <div style="margin-top: 2rem;">
                      <a href="/" style="display: inline-block; background-color: #6b7280; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 500;">
                          홈으로 이동
                      </a>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `, {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }
  
  // 교사키가 유효하면 원본 페이지 제공
  const res = await context.next();
  const newHeaders = new Headers(res.headers);
  newHeaders.set('Cache-Control', 'no-store');
  return new Response(res.body, { status: res.status, headers: newHeaders });
};
