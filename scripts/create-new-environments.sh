#!/bin/bash

# 새로운 환경 생성 스크립트
# 기존 구조에 전혀 영향을 주지 않으면서 새로운 환경 구축

set -e

echo "🏗️ 새로운 환경 생성 시작 (기존에 영향 없음)..."

# 1. 새로운 환경 폴더 생성
echo "📁 새로운 폴더 구조 생성..."
mkdir -p production/src/science-experiments
mkdir -p testing/src/science-experiments
mkdir -p archives/{versions,temps,backups/{daily,weekly,releases}}
mkdir -p docs/{deployment,testing,api,user-guides}
mkdir -p scripts config project

echo "  ✅ 새로운 폴더 구조 생성 완료"

# 2. 기존 파일 복사 (이동하지 않음)
echo "📦 기존 파일 복사 (이동하지 않음)..."

# suhaeng3 복사
if [ -d "class-site/science-experiments/suhaeng3" ]; then
    cp -r class-site/science-experiments/suhaeng3 production/src/science-experiments/
    echo "  ✅ suhaeng3 → production 복사 완료"
else
    echo "  ⚠️ suhaeng3 폴더가 존재하지 않습니다."
fi

# suhaeng3-test 복사
if [ -d "class-site/science-experiments/suhaeng3-test" ]; then
    cp -r class-site/science-experiments/suhaeng3-test testing/src/science-experiments/
    echo "  ✅ suhaeng3-test → testing 복사 완료"
else
    echo "  ⚠️ suhaeng3-test 폴더가 존재하지 않습니다."
fi

# 함수들 복사
if [ -d "class-site/netlify/functions" ]; then
    cp -r class-site/netlify/functions production/
    cp -r class-site/netlify/functions testing/
    echo "  ✅ functions → production, testing 복사 완료"
else
    echo "  ⚠️ functions 폴더가 존재하지 않습니다."
fi

# 모듈들 복사
if [ -d "class-site/science-experiments/modules" ]; then
    cp -r class-site/science-experiments/modules production/src/
    cp -r class-site/science-experiments/modules testing/src/
    echo "  ✅ modules → production, testing 복사 완료"
else
    echo "  ⚠️ modules 폴더가 존재하지 않습니다."
fi

# 3. 설정 파일들 복사
echo "⚙️ 설정 파일들 복사..."
if [ -f "class-site/package.json" ]; then
    cp class-site/package.json production/
    cp class-site/package.json testing/
    echo "  ✅ package.json 복사 완료"
fi

if [ -f "netlify.toml" ]; then
    cp netlify.toml config/
    echo "  ✅ netlify.toml → config 복사 완료"
fi

# 4. 문서들 복사
echo "📖 문서들 복사..."
if [ -d "docs" ]; then
    cp -r docs/* docs/
    echo "  ✅ 기존 문서들 복사 완료"
fi

# 5. 프로젝트 관리 파일들 복사
echo "📋 프로젝트 관리 파일들 복사..."
for file in CHANGELOG.md PHASE1_CHANGES.md PHASE2_CHANGES.md ROLLBACK_GUIDE.md *.md; do
    if [ -f "$file" ]; then
        cp "$file" project/
        echo "  → $file 복사 완료"
    fi
done

# 6. temps 폴더 정리
echo "📚 temps 폴더 정리..."
if [ -d "temps" ]; then
    cp -r temps/* archives/temps/
    echo "  ✅ temps → archives/temps 복사 완료"
else
    echo "  ⚠️ temps 폴더가 존재하지 않습니다."
fi

# 7. 현재 버전을 아카이브에 저장
echo "📚 현재 버전을 아카이브에 저장..."
VERSION=$(date +"%Y%m%d_%H%M%S")
mkdir -p archives/versions/v$VERSION
cp -r class-site/* archives/versions/v$VERSION/
echo "  ✅ 현재 버전 아카이브 완료: v$VERSION"

# 8. 환경별 독립적인 설정 생성
echo "⚙️ 환경별 독립적인 설정 생성..."

# Production 설정
cat > production/netlify.toml << 'EOF'
[build]
  base    = "."
  publish = "src"

[functions]
  directory = "functions"
  node_bundler = "esbuild"

# Production-specific routing
[[edge_functions]]
path = "/science-experiments/suhaeng3/session2"
function = "gate-session2"

[[edge_functions]]
path = "/science-experiments/suhaeng3/session2.html"
function = "gate-session2"

[[edge_functions]]
path = "/science-experiments/suhaeng3/session2/*"
function = "gate-session2"

# Production-specific headers
[[headers]]
for = "/science-experiments/suhaeng3/index.html"
  [headers.values]
  Cache-Control = "no-store"

[[headers]]
for = "/science-experiments/suhaeng3/session2.html"
  [headers.values]
  Cache-Control = "no-store"

[[headers]]
for = "/*"
  [headers.values]
  X-Environment = "production"
  X-Version = "1.0.0"
EOF

# Testing 설정
cat > testing/netlify.toml << 'EOF'
[build]
  base    = "."
  publish = "src"

[functions]
  directory = "functions"
  node_bundler = "esbuild"

# Testing-specific routing
[[edge_functions]]
path = "/science-experiments/suhaeng3-test/session2"
function = "gate-session2"

[[edge_functions]]
path = "/science-experiments/suhaeng3-test/session2.html"
function = "gate-session2"

[[edge_functions]]
path = "/science-experiments/suhaeng3-test/session2/*"
function = "gate-session2"

# Test functions routing
[[redirects]]
from = "/.netlify/functions/submit_test"
to = "/.netlify/functions/submit_test"
status = 200

[[redirects]]
from = "/.netlify/functions/download_test"
to = "/.netlify/functions/download_test"
status = 200

# Testing-specific headers
[[headers]]
for = "/science-experiments/suhaeng3-test/index.html"
  [headers.values]
  Cache-Control = "no-store"

[[headers]]
for = "/science-experiments/suhaeng3-test/session2.html"
  [headers.values]
  Cache-Control = "no-store"

[[headers]]
for = "/*"
  [headers.values]
  X-Environment = "testing"
  X-Version = "1.2.0"
  X-Testing = "true"
EOF

echo "  ✅ 환경별 설정 파일 생성 완료"

# 9. 생성 완료 메시지
echo "✅ 새로운 환경 생성 완료!"
echo ""
echo "📁 생성된 구조:"
echo "  production/     - 새로운 운영 환경 (별도 배포)"
echo "  testing/        - 새로운 테스트 환경 (별도 배포)"
echo "  archives/       - 백업 및 아카이브"
echo "  docs/           - 문서화"
echo "  scripts/        - 유틸리티 스크립트"
echo "  config/         - 설정 파일들"
echo "  project/        - 프로젝트 관리"
echo ""
echo "🛡️ 안전성 보장:"
echo "  - 기존 class-site/ 구조는 전혀 변경되지 않음"
echo "  - 기존 파일들은 이동하지 않고 복사만 함"
echo "  - 기존 설정은 수정하지 않음"
echo "  - 기존 배포는 전혀 영향받지 않음"
echo ""
echo "🔄 다음 단계:"
echo "  1. 새로운 환경 검증: ls -la production/ testing/"
echo "  2. 독립적인 배포: ./scripts/deploy-new-environment.sh production"
echo "  3. 기존 배포 확인: 기존 웹 주소 정상 작동 확인"
echo ""
echo "⚠️ 주의사항:"
echo "  - 새로운 환경은 별도의 도메인/경로를 사용해야 함"
echo "  - 기존 배포와 완전히 독립적으로 운영됨"
echo "  - 언제든지 새로운 구조를 삭제 가능함"
