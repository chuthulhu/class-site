export async function onRequest(context) {
    return new Response("Functions are working!", {
        status: 200,
        headers: {
            "Content-Type": "text/plain"
        }
    });
}
