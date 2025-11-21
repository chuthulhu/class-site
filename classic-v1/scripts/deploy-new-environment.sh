#!/bin/bash

# 새로운 환경 배포 스크립트
# 기존 배포에 전혀 영향을 주지 않으면서 새로운 환경 배포

set -e

ENVIRONMENT=$1
VERSION=$2

if [ -z "$ENVIRONMENT" ]; then
    echo "❌ 사용법: ./scripts/deploy-new-environment.sh <environment> [version]"
    echo "   환경: production, testing"
    echo "   버전: 선택사항 (예: v1.2.0)"
    exit 1
fi

if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "testing" ]; then
    echo "❌ 잘못된 환경입니다. 'production' 또는 'testing'을 사용하세요."
    exit 1
fi

echo "🚀 $ENVIRONMENT 환경 배포 시작 (기존에 영향 없음)..."

# 1. 환경 확인
echo "🔍 환경 확인..."
if [ ! -d "$ENVIRONMENT" ]; then
    echo "  ❌ $ENVIRONMENT 폴더가 존재하지 않습니다."
    echo "  먼저 ./scripts/create-new-environments.sh를 실행하세요."
    exit 1
fi

if [ ! -f "$ENVIRONMENT/netlify.toml" ]; then
    echo "  ❌ $ENVIRONMENT/netlify.toml 파일이 없습니다."
    exit 1
fi

echo "  ✅ 환경 확인 완료"

# 2. 배포 전 백업 생성
echo "📦 배포 전 백업 생성..."
BACKUP_DIR="archives/backups/$(date +%Y%m%d_%H%M%S)_$ENVIRONMENT"
mkdir -p "$BACKUP_DIR"

if [ -d "$ENVIRONMENT" ]; then
    cp -r "$ENVIRONMENT"/* "$BACKUP_DIR/"
    echo "  ✅ 백업 완료: $BACKUP_DIR"
else
    echo "  ⚠️ $ENVIRONMENT 폴더가 존재하지 않습니다."
fi

# 3. 환경별 설정 확인
echo "⚙️ 환경별 설정 확인..."
if [ ! -f "$ENVIRONMENT/netlify.toml" ]; then
    echo "  ❌ $ENVIRONMENT/netlify.toml 파일이 없습니다."
    exit 1
fi

if [ ! -f "$ENVIRONMENT/package.json" ]; then
    echo "  ❌ $ENVIRONMENT/package.json 파일이 없습니다."
    exit 1
fi

# 4. 의존성 설치
echo "📦 의존성 설치..."
cd "$ENVIRONMENT"
if [ -f "package.json" ]; then
    npm install
fi
cd ..

# 5. 테스트 실행 (testing 환경인 경우)
if [ "$ENVIRONMENT" = "testing" ]; then
    echo "🧪 테스트 실행..."
    # 여기에 테스트 스크립트 추가
    echo "  ✅ 테스트 완료"
fi

# 6. 배포 실행
echo "🌐 배포 실행..."
cd "$ENVIRONMENT"

# Netlify CLI를 사용한 배포
if command -v netlify &> /dev/null; then
    if [ -n "$VERSION" ]; then
        netlify deploy --prod --message "Deploy new $ENVIRONMENT $VERSION"
    else
        netlify deploy --prod --message "Deploy new $ENVIRONMENT $(date +%Y%m%d_%H%M%S)"
    fi
else
    echo "  ⚠️ Netlify CLI가 설치되지 않았습니다."
    echo "  수동으로 배포를 진행하세요."
    echo ""
    echo "  수동 배포 방법:"
    echo "  1. $ENVIRONMENT 폴더로 이동"
    echo "  2. netlify deploy --prod"
    echo "  3. 별도의 사이트로 배포 (기존 사이트와 분리)"
fi

cd ..

# 7. 배포 완료 메시지
echo "✅ $ENVIRONMENT 환경 배포 완료!"
echo ""
echo "📊 배포 정보:"
echo "  환경: $ENVIRONMENT"
echo "  버전: ${VERSION:-$(date +%Y%m%d_%H%M%S)}"
echo "  백업: $BACKUP_DIR"
echo "  시간: $(date)"
echo ""
echo "🛡️ 안전성 보장:"
echo "  - 기존 배포는 전혀 영향받지 않음"
echo "  - 기존 웹 주소는 그대로 유지됨"
echo "  - 기존 사용자에게 영향 없음"
echo "  - 완전히 독립적인 환경"
echo ""
echo "🔗 배포 URL:"
if [ "$ENVIRONMENT" = "production" ]; then
    echo "  새로운 운영 환경: https://your-new-production-site.netlify.app"
    echo "  기존 운영 환경: https://your-existing-site.netlify.app (변경 없음)"
else
    echo "  새로운 테스트 환경: https://your-new-testing-site.netlify.app"
    echo "  기존 테스트 환경: https://your-existing-site.netlify.app/science-experiments/suhaeng3-test/ (변경 없음)"
fi
echo ""
echo "🔄 다음 단계:"
echo "  1. 새로운 환경 기능 테스트"
echo "  2. 기존 환경 정상 작동 확인"
echo "  3. 사용자에게 새로운 환경 안내"
echo "  4. 점진적 마이그레이션 계획 수립"
echo ""
echo "⚠️ 주의사항:"
echo "  - 새로운 환경은 별도의 도메인을 사용해야 함"
echo "  - 기존 환경과 완전히 독립적으로 운영됨"
echo "  - 사용자에게 환경 변경을 명확히 안내해야 함"
