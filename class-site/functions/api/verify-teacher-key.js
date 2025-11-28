export async function onRequest(context) {
    const { request, env } = context;

    // CORS 헤더 설정
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    // OPTIONS 요청 처리 (CORS preflight)
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers,
        });
    }

    // POST 요청만 허용
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers,
        });
    }

    try {
        // 요청 본문 파싱
        const bodyText = await request.text();
        const { key } = bodyText ? JSON.parse(bodyText) : {};
        
        if (!key) {
            return new Response(JSON.stringify({ 
                valid: false, 
                error: '교사키가 제공되지 않았습니다.' 
            }), {
                status: 400,
                headers,
            });
        }

        // 환경변수에서 교사키 가져오기
        const validKeys = env.TEACHER_ACCESS_KEY ? 
            env.TEACHER_ACCESS_KEY.split(',').map(k => k.trim()) : 
            [];

        // 교사키 검증
        const isValid = validKeys.includes(key);

        return new Response(JSON.stringify({ 
            valid: isValid,
            message: isValid ? '교사키가 유효합니다.' : '교사키가 유효하지 않습니다.'
        }), {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error('교사키 검증 오류:', error);
        
        return new Response(JSON.stringify({ 
            valid: false, 
            error: '서버 오류가 발생했습니다.' 
        }), {
            status: 500,
            headers,
        });
    }
}
