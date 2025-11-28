export async function onRequest(context) {
    const { request, env } = context;

    // CORS 헤더 설정
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // OPTIONS 요청 처리 (CORS preflight)
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers
        });
    }

    // POST 요청만 허용
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers
        });
    }

    try {
        // 요청 본문 파싱
        const bodyText = await request.text();
        const body = bodyText ? JSON.parse(bodyText) : {};
        console.log('요청 본문:', bodyText);
        
        const { password } = body;
        console.log('받은 암호:', password ? '[입력됨]' : '[없음]');
        
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
        console.log('환경변수 암호:', adminPassword ? '[설정됨]' : '[기본값 사용]');
        
        // 암호 확인 (대소문자 구분)
        if (password.trim() === adminPassword.trim()) {
            console.log('인증 성공');
            return new Response(JSON.stringify({ 
                success: true, 
                message: '인증 성공',
                timestamp: new Date().toISOString()
            }), {
                status: 200,
                headers
            });
        } else {
            console.log('인증 실패: 암호 불일치');
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
