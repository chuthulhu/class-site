exports.handler = async () => {
  const now = new Date();
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify({ now: now.getTime(), iso: now.toISOString() }),
  };
};
