export async function onRequest() {
  const now = new Date();
  return new Response(JSON.stringify({ now: now.getTime(), iso: now.toISOString() }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
