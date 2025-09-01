export default async (request, context) => {
  // Gate until release instant (KST 2025-09-15 00:00 = UTC 2025-09-14T15:00:00Z)
  const FALLBACK_RELEASE = '2025-09-14T15:00:00Z';
  const envRelease = Deno.env.get('SESSION2_RELEASE_UTC');
  const RELEASE_UTC = Date.parse(envRelease || FALLBACK_RELEASE);

  const nowUTC = Date.now();
  const beforeRelease = Number.isFinite(RELEASE_UTC) ? nowUTC < RELEASE_UTC : true;

  if (beforeRelease) {
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
