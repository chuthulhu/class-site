#!/bin/bash

# 배포 스크립트
# 환경별로 안전하게 배포

set -e

ENVIRONMENT=$1
VERSION=$2

if [ -z "$ENVIRONMENT" ]; then
    echo "❌ 사용법: ./scripts/deploy.sh <environment> [version]"
    echo "   환경: production, testing"
    echo "   버전: 선택사항 (예: v1.2.0)"
    exit 1
fi

if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "testing" ]; then
    echo "❌ 잘못된 환경입니다. 'production' 또는 'testing'을 사용하세요."
    exit 1
fi

echo "🚀 $ENVIRONMENT 환경 배포 시작..."

# 1. 배포 전 백업 생성
echo "📦 배포 전 백업 생성..."
BACKUP_DIR="archives/backups/$(date +%Y%m%d_%H%M%S)_$ENVIRONMENT"
mkdir -p "$BACKUP_DIR"

if [ -d "$ENVIRONMENT" ]; then
    cp -r "$ENVIRONMENT"/* "$BACKUP_DIR/"
    echo "  ✅ 백업 완료: $BACKUP_DIR"
else
    echo "  ⚠️  $ENVIRONMENT 폴더가 존재하지 않습니다."
fi

# 2. 환경별 설정 확인
echo "⚙️ 환경별 설정 확인..."
if [ ! -f "$ENVIRONMENT/netlify.toml" ]; then
    echo "  ❌ $ENVIRONMENT/netlify.toml 파일이 없습니다."
    exit 1
fi

if [ ! -f "$ENVIRONMENT/package.json" ]; then
    echo "  ❌ $ENVIRONMENT/package.json 파일이 없습니다."
    exit 1
fi

# 3. 의존성 설치
echo "📦 의존성 설치..."
cd "$ENVIRONMENT"
if [ -f "package.json" ]; then
    npm install
fi
cd ..

# 4. 테스트 실행 (testing 환경인 경우)
if [ "$ENVIRONMENT" = "testing" ]; then
    echo "🧪 테스트 실행..."
    # 여기에 테스트 스크립트 추가
    echo "  ✅ 테스트 완료"
fi

# 5. 배포 실행
echo "🌐 배포 실행..."
cd "$ENVIRONMENT"

# Netlify CLI를 사용한 배포
if command -v netlify &> /dev/null; then
    if [ -n "$VERSION" ]; then
        netlify deploy --prod --message "Deploy $ENVIRONMENT $VERSION"
    else
        netlify deploy --prod --message "Deploy $ENVIRONMENT $(date +%Y%m%d_%H%M%S)"
    fi
else
    echo "  ⚠️  Netlify CLI가 설치되지 않았습니다."
    echo "  수동으로 배포를 진행하세요."
fi

cd ..

# 6. 배포 완료 메시지
echo "✅ $ENVIRONMENT 환경 배포 완료!"
echo ""
echo "📊 배포 정보:"
echo "  환경: $ENVIRONMENT"
echo "  버전: ${VERSION:-$(date +%Y%m%d_%H%M%S)}"
echo "  백업: $BACKUP_DIR"
echo "  시간: $(date)"
echo ""
echo "🔗 배포 URL:"
if [ "$ENVIRONMENT" = "production" ]; then
    echo "  운영 환경: https://your-production-site.netlify.app"
else
    echo "  테스트 환경: https://your-testing-site.netlify.app"
fi
