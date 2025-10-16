export default async (request, context) => {
  const url = new URL(request.url);
  
  // 교사키 검증
  const TEACHER_KEY = Deno.env.get('TEACHER_ACCESS_KEY') || '';
  const providedKey = url.searchParams.get('key') || '';
  const hasValidKey = TEACHER_KEY && providedKey && providedKey === TEACHER_KEY;
  
  // 교사키가 없거나 유효하지 않으면 실제 404 반환
  if (!hasValidKey) {
    return new Response('Not Found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
  
  // 교사키가 유효하면 원본 페이지 제공
  const res = await context.next();
  const newHeaders = new Headers(res.headers);
  newHeaders.set('Cache-Control', 'no-store');
  return new Response(res.body, { status: res.status, headers: newHeaders });
};
