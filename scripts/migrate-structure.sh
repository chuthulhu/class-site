#!/bin/bash

# 프로젝트 구조 마이그레이션 스크립트
# 기존 구조를 새로운 구조로 이동

set -e

echo "🚀 프로젝트 구조 마이그레이션 시작..."

# 1. 새로운 구조 생성
echo "📁 새로운 폴더 구조 생성..."
mkdir -p production/src/science-experiments
mkdir -p testing/src/science-experiments
mkdir -p archives/{versions,temps,backups/{daily,weekly,releases}}
mkdir -p docs/{deployment,testing,api,user-guides}
mkdir -p scripts config project

# 2. 기존 파일들을 적절한 위치로 이동
echo "📦 파일 이동 중..."

# 운영 환경 (안정화된 버전)
if [ -d "class-site/science-experiments/suhaeng3" ]; then
    echo "  → suhaeng3를 production으로 이동..."
    cp -r class-site/science-experiments/suhaeng3 production/src/science-experiments/
fi

# 테스트 환경 (개발 중인 기능)
if [ -d "class-site/science-experiments/suhaeng3-test" ]; then
    echo "  → suhaeng3-test를 testing으로 이동..."
    cp -r class-site/science-experiments/suhaeng3-test testing/src/science-experiments/
fi

# 백업 파일들
if [ -d "temps" ]; then
    echo "  → temps를 archives로 이동..."
    cp -r temps/* archives/temps/
fi

# 함수들
if [ -d "class-site/netlify/functions" ]; then
    echo "  → 함수들을 production으로 이동..."
    cp -r class-site/netlify/functions production/
fi

# 모듈들
if [ -d "class-site/science-experiments/modules" ]; then
    echo "  → 모듈들을 production으로 이동..."
    cp -r class-site/science-experiments/modules production/src/
fi

# 3. 설정 파일들 복사
echo "⚙️ 설정 파일 복사..."
if [ -f "netlify.toml" ]; then
    cp netlify.toml config/
    cp netlify.toml production/
    cp netlify.toml testing/
fi

if [ -f "class-site/package.json" ]; then
    cp class-site/package.json config/
    cp class-site/package.json production/
    cp class-site/package.json testing/
fi

# 4. 문서들 이동
echo "📖 문서 이동..."
if [ -d "docs" ]; then
    cp -r docs/* docs/
fi

# 5. 프로젝트 관리 파일들 이동
echo "📋 프로젝트 관리 파일 이동..."
if [ -f "CHANGELOG.md" ]; then
    cp CHANGELOG.md project/
fi
if [ -f "PHASE1_CHANGES.md" ]; then
    cp PHASE1_CHANGES.md project/
fi
if [ -f "PHASE2_CHANGES.md" ]; then
    cp PHASE2_CHANGES.md project/
fi
if [ -f "ROLLBACK_GUIDE.md" ]; then
    cp ROLLBACK_GUIDE.md project/
fi

# 6. 현재 버전을 아카이브에 저장
echo "📚 현재 버전을 아카이브에 저장..."
VERSION=$(date +"%Y%m%d_%H%M%S")
mkdir -p archives/versions/v$VERSION
cp -r class-site/* archives/versions/v$VERSION/

# 7. 마이그레이션 완료 메시지
echo "✅ 마이그레이션 완료!"
echo ""
echo "📁 새로운 구조:"
echo "  production/     - 운영 환경 (안정화된 버전)"
echo "  testing/        - 테스트 환경 (개발 중인 기능)"
echo "  archives/       - 백업 및 아카이브"
echo "  docs/           - 문서화"
echo "  scripts/        - 유틸리티 스크립트"
echo "  config/         - 설정 파일들"
echo "  project/        - 프로젝트 관리"
echo ""
echo "🔄 다음 단계:"
echo "  1. 각 환경별 설정 파일 검토 및 수정"
echo "  2. 배포 스크립트 작성"
echo "  3. 백업 시스템 구축"
echo "  4. 테스트 환경 검증"
