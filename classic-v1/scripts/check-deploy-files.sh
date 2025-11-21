#!/bin/bash

# Netlify 배포 파일 확인 스크립트
# 이 스크립트는 실제 배포될 파일들을 확인합니다

echo "🚀 Netlify 배포 파일 확인"
echo "=========================="

echo ""
echo "✅ 배포될 파일들:"
echo "-------------------"

# 프로덕션 파일들 확인
if [ -f "index.html" ]; then
    echo "✓ index.html (메인 포털)"
fi

if [ -d "physics2" ]; then
    echo "✓ physics2/ (물리학II 활동지)"
fi

if [ -d "science-experiments" ]; then
    echo "✓ science-experiments/ (과학탐구실험)"
fi

if [ -d "netlify/functions" ]; then
    echo "✓ netlify/functions/ (서버 함수)"
fi

echo ""
echo "❌ 배포에서 제외될 파일들:"
echo "-------------------------"

# 제외될 파일들 확인
excluded_files=(
    "local-dev-config.js"
    "env.example"
    "environment.txt"
    "local-dev-config.example.js"
    "docs/"
    "node_modules/"
    "package.json"
    "package-lock.json"
    "ROLLBACK_GUIDE.md"
)

for file in "${excluded_files[@]}"; do
    if [ -e "$file" ]; then
        echo "✗ $file (개발용 파일)"
    fi
done

echo ""
echo "📊 배포 상태:"
echo "-------------"

# 배포 파일 크기 확인
deploy_size=$(du -sh . --exclude=docs --exclude=node_modules --exclude=local-dev-config.js --exclude=env.example --exclude=environment.txt --exclude=local-dev-config.example.js --exclude=package.json --exclude=package-lock.json --exclude=ROLLBACK_GUIDE.md 2>/dev/null | cut -f1)
echo "배포 크기: $deploy_size"

echo ""
echo "🔧 개발 환경 설정:"
echo "-----------------"

if [ -f "local-dev-config.js" ]; then
    echo "✓ 로컬 개발 설정 파일 존재"
else
    echo "⚠️  로컬 개발 설정 파일 없음"
    echo "   cp local-dev-config.example.js local-dev-config.js 실행 필요"
fi

echo ""
echo "✅ 배포 준비 완료!"
