export async function onRequest(context) {
  const { next } = context;
  // 교사키 우회접속 해제: 일반적인 주소로 정상적인 페이지 제공
  const res = await next();
  const newHeaders = new Headers(res.headers);
  newHeaders.set('Cache-Control', 'no-store');
  return new Response(res.body, { status: res.status, headers: newHeaders });
}
