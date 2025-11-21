exports.handler = async (event, context) => {
    // CORS 헤더 설정
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // OPTIONS 요청 처리 (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // POST 요청만 허용
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // 요청 본문 파싱
        const body = event.body || '{}';
        console.log('요청 본문:', body);
        
        const { password } = JSON.parse(body);
        console.log('받은 암호:', password ? '[입력됨]' : '[없음]');
        
        // 입력값 검증
        if (!password || typeof password !== 'string') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: '암호를 입력해주세요' 
                })
            };
        }
        
        // 환경변수에서 관리자 암호 가져오기
        const adminPassword = process.env.ADMIN_PASSWORD || 'teacher2024';
        console.log('환경변수 암호:', adminPassword ? '[설정됨]' : '[기본값 사용]');
        
        // 암호 확인 (대소문자 구분)
        if (password.trim() === adminPassword.trim()) {
            console.log('인증 성공');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    message: '인증 성공',
                    timestamp: new Date().toISOString()
                })
            };
        } else {
            console.log('인증 실패: 암호 불일치');
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: '잘못된 암호입니다' 
                })
            };
        }
    } catch (error) {
        console.error('인증 오류:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: '서버 오류가 발생했습니다' 
            })
        };
    }
};
