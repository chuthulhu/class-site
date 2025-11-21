exports.handler = async (event, context) => {
    // CORS 헤더 설정
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    // OPTIONS 요청 처리 (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    // POST 요청만 허용
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        // 요청 본문 파싱
        const { key } = JSON.parse(event.body || '{}');
        
        if (!key) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    valid: false, 
                    error: '교사키가 제공되지 않았습니다.' 
                }),
            };
        }

        // Netlify 환경변수에서 교사키 가져오기
        const validKeys = process.env.TEACHER_ACCESS_KEY ? 
            process.env.TEACHER_ACCESS_KEY.split(',').map(k => k.trim()) : 
            [];

        // 교사키 검증
        const isValid = validKeys.includes(key);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                valid: isValid,
                message: isValid ? '교사키가 유효합니다.' : '교사키가 유효하지 않습니다.'
            }),
        };

    } catch (error) {
        console.error('교사키 검증 오류:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                valid: false, 
                error: '서버 오류가 발생했습니다.' 
            }),
        };
    }
};
