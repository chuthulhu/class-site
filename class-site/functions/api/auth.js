export async function onRequestOptions(context) {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Max-Age': '86400'
        }
    });
}

export async function onRequestPost(context) {
    const { request, env } = context;

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    try {
        // 요청 본문 파싱
        const bodyText = await request.text();
        const body = bodyText ? JSON.parse(bodyText) : {};
        
        const { password } = body;
        
        // 입력값 검증
        if (!password || typeof password !== 'string') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '암호를 입력해주세요' 
            }), {
                status: 400,
                headers
            });
        }
        
        // 환경변수에서 관리자 암호 가져오기
        const adminPassword = env.ADMIN_PASSWORD || 'teacher2024';
        
        // 암호 확인 (대소문자 구분)
        if (password.trim() === adminPassword.trim()) {
            return new Response(JSON.stringify({ 
                success: true, 
                message: '인증 성공',
                timestamp: new Date().toISOString()
            }), {
                status: 200,
                headers
            });
        } else {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '잘못된 암호입니다' 
            }), {
                status: 401,
                headers
            });
        }
    } catch (error) {
        console.error('인증 오류:', error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: '서버 오류가 발생했습니다' 
        }), {
            status: 500,
            headers
        });
    }
}
