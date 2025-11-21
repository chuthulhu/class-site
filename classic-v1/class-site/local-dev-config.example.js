// 로컬 개발 환경 설정 템플릿
// 이 파일을 local-dev-config.js로 복사하여 사용하세요
// 주의: local-dev-config.js는 .gitignore에 포함되어 Git에 커밋되지 않습니다

window.LOCAL_DEV_CONFIG = {
    // 로컬 개발용 암호 (실제 운영시에는 Netlify Functions 사용)
    ADMIN_PASSWORD: 'teacher2024',
    
    // 로컬 개발 모드 활성화 여부
    ENABLE_LOCAL_AUTH: true,
    
    // 디버깅 모드
    DEBUG_MODE: true
};

// 사용법:
// 1. 이 파일을 local-dev-config.js로 복사
// 2. 필요시 ADMIN_PASSWORD 값을 변경
// 3. 로컬 서버에서 테스트
