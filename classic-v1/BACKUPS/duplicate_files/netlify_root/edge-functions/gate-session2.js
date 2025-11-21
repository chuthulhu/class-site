export default async (request, context) => {
  // Block window: KST 2025-09-07 00:00:00 ~ 2025-09-14 23:59:59
  // Convert to UTC for comparison: 2025-09-06T15:00:00Z to 2025-09-14T14:59:59Z
  const BLOCK_START_UTC = Date.parse('2025-09-06T15:00:00Z');
  const BLOCK_END_UTC = Date.parse('2025-09-14T14:59:59Z');

  // If env provides a single release instant, keep for possible future use
  const RELEASE_UTC = Date.parse(Deno.env.get('SESSION2_RELEASE_UTC') || '');

  const nowUTC = Date.now();

  const isInBlock = nowUTC >= BLOCK_START_UTC && nowUTC <= BLOCK_END_UTC;

  if (isInBlock) {
    const redirectUrl = new URL('/science-experiments/suhaeng3/session1.html', request.url);
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl.toString(),
        'Cache-Control': 'no-store',
      },
    });
  }

  // Outside block: allow normal handling
  const res = await context.next();
  const newHeaders = new Headers(res.headers);
  newHeaders.set('Cache-Control', 'no-store');
  return new Response(res.body, { status: res.status, headers: newHeaders });
};
