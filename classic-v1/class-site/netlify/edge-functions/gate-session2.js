export default async (request, context) => {
  const url = new URL(request.url);
  const nowUTC = Date.now();

  // Block only within KST 2025-09-07 00:00:00 ~ 2025-09-14 23:59:59
  // UTC equivalents: 2025-09-06T15:00:00Z ~ 2025-09-14T14:59:59Z
  const BLOCK_START_UTC = Date.parse('2025-09-06T15:00:00Z');
  const BLOCK_END_UTC = Date.parse('2025-09-14T14:59:59Z');
  const inBlock = nowUTC >= BLOCK_START_UTC && nowUTC <= BLOCK_END_UTC;

  // Teacher bypass via secret key in query (?key=...) matched against env TEACHER_ACCESS_KEY
  const TEACHER_KEY = Deno.env.get('TEACHER_ACCESS_KEY') || '';
  const providedKey = url.searchParams.get('key') || '';
  const hasBypass = TEACHER_KEY && providedKey && providedKey === TEACHER_KEY;

  if (inBlock && !hasBypass) {
    const redirectUrl = new URL('/science-experiments/suhaeng3/session1.html', request.url);
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl.toString(),
        'Cache-Control': 'no-store',
      },
    });
  }

  const res = await context.next();
  const newHeaders = new Headers(res.headers);
  newHeaders.set('Cache-Control', 'no-store');
  return new Response(res.body, { status: res.status, headers: newHeaders });
};
