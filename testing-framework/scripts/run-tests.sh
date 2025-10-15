#!/bin/bash

# 웹앱 호환성 테스트 실행 스크립트
# 기존 웹앱에 전혀 영향을 주지 않는 독립적인 테스트

set -e

echo "🚀 웹앱 호환성 테스트 시작..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 의존성 확인
check_dependencies() {
    print_status "의존성 확인 중..."
    
    # Node.js 확인
    if ! command -v node &> /dev/null; then
        print_error "Node.js가 설치되지 않았습니다."
        exit 1
    fi
    
    # Python 확인
    if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
        print_error "Python이 설치되지 않았습니다."
        exit 1
    fi
    
    print_success "모든 의존성이 확인되었습니다."
}

# 테스트 환경 설정
setup_environment() {
    print_status "테스트 환경 설정 중..."
    
    # 테스트 프레임워크 디렉토리로 이동
    cd "$(dirname "$0")/.."
    
    # 의존성 설치
    if [ ! -d "node_modules" ]; then
        print_status "npm 의존성 설치 중..."
        npm install
    fi
    
    # Playwright 브라우저 설치
    print_status "Playwright 브라우저 설치 중..."
    npx playwright install --with-deps
    
    print_success "테스트 환경 설정 완료"
}

# 웹 서버 시작
start_webserver() {
    print_status "웹 서버 시작 중..."
    
    # 기존 서버 프로세스 종료
    pkill -f "python.*http.server" || true
    
    # 웹 서버 시작 (백그라운드)
    cd ../class-site
    python -m http.server 8080 > /dev/null 2>&1 &
    SERVER_PID=$!
    
    # 서버 시작 대기
    sleep 5
    
    # 서버 상태 확인
    if curl -s http://localhost:8080 > /dev/null; then
        print_success "웹 서버가 성공적으로 시작되었습니다. (PID: $SERVER_PID)"
    else
        print_error "웹 서버 시작에 실패했습니다."
        exit 1
    fi
}

# 테스트 실행
run_tests() {
    print_status "호환성 테스트 실행 중..."
    
    cd ../testing-framework
    
    # 테스트 유형 선택
    case "${1:-all}" in
        "desktop")
            print_status "데스크톱 환경 테스트 실행..."
            npx playwright test --project=chrome-desktop --project=firefox-desktop --project=safari-desktop
            ;;
        "mobile")
            print_status "모바일 환경 테스트 실행..."
            npx playwright test --project=android-chrome --project=ios-safari --project=android-samsung
            ;;
        "performance")
            print_status "성능 테스트 실행..."
            npx lhci autorun
            ;;
        "all")
            print_status "전체 테스트 실행..."
            npx playwright test
            npx lhci autorun
            ;;
        *)
            print_error "알 수 없는 테스트 유형: $1"
            print_status "사용 가능한 옵션: desktop, mobile, performance, all"
            exit 1
            ;;
    esac
    
    print_success "테스트 실행 완료"
}

# 리포트 생성
generate_reports() {
    print_status "테스트 리포트 생성 중..."
    
    # Playwright HTML 리포트 생성
    npx playwright show-report --port 8081 &
    REPORT_PID=$!
    
    # 통합 리포트 생성
    node scripts/generate-report.js
    
    print_success "리포트 생성 완료"
    print_status "Playwright 리포트: http://localhost:8081"
    print_status "통합 리포트: reports/comprehensive/"
}

# 정리 작업
cleanup() {
    print_status "정리 작업 중..."
    
    # 웹 서버 종료
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
        print_status "웹 서버 종료됨"
    fi
    
    # 리포트 서버 종료
    if [ ! -z "$REPORT_PID" ]; then
        kill $REPORT_PID 2>/dev/null || true
        print_status "리포트 서버 종료됨"
    fi
    
    print_success "정리 작업 완료"
}

# 메인 실행 함수
main() {
    # 트랩 설정 (스크립트 종료 시 정리 작업 실행)
    trap cleanup EXIT
    
    # 테스트 유형 파라미터
    TEST_TYPE="${1:-all}"
    
    print_status "테스트 유형: $TEST_TYPE"
    
    # 단계별 실행
    check_dependencies
    setup_environment
    start_webserver
    run_tests "$TEST_TYPE"
    generate_reports
    
    print_success "모든 테스트가 완료되었습니다! 🎉"
}

# 도움말 표시
show_help() {
    echo "웹앱 호환성 테스트 스크립트"
    echo ""
    echo "사용법: $0 [테스트유형]"
    echo ""
    echo "테스트 유형:"
    echo "  desktop     - 데스크톱 브라우저 테스트"
    echo "  mobile      - 모바일 브라우저 테스트"
    echo "  performance - 성능 테스트"
    echo "  all         - 전체 테스트 (기본값)"
    echo ""
    echo "예시:"
    echo "  $0 desktop"
    echo "  $0 mobile"
    echo "  $0 all"
}

# 스크립트 실행
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
else
    main "$@"
fi

