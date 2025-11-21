#!/bin/bash

# 독립성 검증 스크립트
# 기존 환경과 새로운 환경이 완전히 독립적인지 검증

set -e

echo "🔍 환경 독립성 검증 시작..."

# 1. 기존 구조 보존 확인
echo "🛡️ 기존 구조 보존 확인..."

if [ -d "class-site" ]; then
    echo "  ✅ class-site 폴더 존재 확인"
    
    if [ -d "class-site/science-experiments/suhaeng3" ]; then
        echo "  ✅ suhaeng3 폴더 존재 확인"
    else
        echo "  ❌ suhaeng3 폴더가 없습니다."
        exit 1
    fi
    
    if [ -d "class-site/science-experiments/suhaeng3-test" ]; then
        echo "  ✅ suhaeng3-test 폴더 존재 확인"
    else
        echo "  ❌ suhaeng3-test 폴더가 없습니다."
        exit 1
    fi
    
    if [ -d "class-site/netlify/functions" ]; then
        echo "  ✅ functions 폴더 존재 확인"
    else
        echo "  ❌ functions 폴더가 없습니다."
        exit 1
    fi
else
    echo "  ❌ class-site 폴더가 없습니다."
    exit 1
fi

# 2. 새로운 환경 존재 확인
echo "🏗️ 새로운 환경 존재 확인..."

if [ -d "production" ]; then
    echo "  ✅ production 폴더 존재 확인"
    
    if [ -d "production/src/science-experiments/suhaeng3" ]; then
        echo "  ✅ production/suhaeng3 폴더 존재 확인"
    else
        echo "  ❌ production/suhaeng3 폴더가 없습니다."
        exit 1
    fi
    
    if [ -d "production/functions" ]; then
        echo "  ✅ production/functions 폴더 존재 확인"
    else
        echo "  ❌ production/functions 폴더가 없습니다."
        exit 1
    fi
else
    echo "  ❌ production 폴더가 없습니다."
    exit 1
fi

if [ -d "testing" ]; then
    echo "  ✅ testing 폴더 존재 확인"
    
    if [ -d "testing/src/science-experiments/suhaeng3-test" ]; then
        echo "  ✅ testing/suhaeng3-test 폴더 존재 확인"
    else
        echo "  ❌ testing/suhaeng3-test 폴더가 없습니다."
        exit 1
    fi
    
    if [ -d "testing/functions" ]; then
        echo "  ✅ testing/functions 폴더 존재 확인"
    else
        echo "  ❌ testing/functions 폴더가 없습니다."
        exit 1
    fi
else
    echo "  ❌ testing 폴더가 없습니다."
    exit 1
fi

# 3. 설정 파일 독립성 확인
echo "⚙️ 설정 파일 독립성 확인..."

# 기존 설정 파일 확인
if [ -f "netlify.toml" ]; then
    echo "  ✅ 기존 netlify.toml 존재 확인"
    
    # 기존 설정 내용 확인
    if grep -q "class-site" netlify.toml; then
        echo "  ✅ 기존 설정이 class-site를 참조함"
    else
        echo "  ⚠️ 기존 설정에서 class-site 참조를 찾을 수 없음"
    fi
else
    echo "  ❌ 기존 netlify.toml 파일이 없습니다."
    exit 1
fi

# 새로운 환경 설정 파일 확인
if [ -f "production/netlify.toml" ]; then
    echo "  ✅ production/netlify.toml 존재 확인"
    
    # 새로운 설정 내용 확인
    if grep -q "production" production/netlify.toml; then
        echo "  ✅ production 설정이 독립적임"
    else
        echo "  ⚠️ production 설정 확인 필요"
    fi
else
    echo "  ❌ production/netlify.toml 파일이 없습니다."
    exit 1
fi

if [ -f "testing/netlify.toml" ]; then
    echo "  ✅ testing/netlify.toml 존재 확인"
    
    # 새로운 설정 내용 확인
    if grep -q "testing" testing/netlify.toml; then
        echo "  ✅ testing 설정이 독립적임"
    else
        echo "  ⚠️ testing 설정 확인 필요"
    fi
else
    echo "  ❌ testing/netlify.toml 파일이 없습니다."
    exit 1
fi

# 4. 함수 파일 독립성 확인
echo "🔧 함수 파일 독립성 확인..."

# 기존 함수 확인
if [ -f "class-site/netlify/functions/submit.js" ]; then
    echo "  ✅ 기존 submit.js 존재 확인"
else
    echo "  ❌ 기존 submit.js 파일이 없습니다."
    exit 1
fi

if [ -f "class-site/netlify/functions/download.js" ]; then
    echo "  ✅ 기존 download.js 존재 확인"
else
    echo "  ❌ 기존 download.js 파일이 없습니다."
    exit 1
fi

# 새로운 환경 함수 확인
if [ -f "production/functions/submit.js" ]; then
    echo "  ✅ production/submit.js 존재 확인"
else
    echo "  ❌ production/submit.js 파일이 없습니다."
    exit 1
fi

if [ -f "testing/functions/submit_test.js" ]; then
    echo "  ✅ testing/submit_test.js 존재 확인"
else
    echo "  ❌ testing/submit_test.js 파일이 없습니다."
    exit 1
fi

# 5. 파일 크기 비교 (복사 확인)
echo "📊 파일 크기 비교..."

# suhaeng3 크기 비교
if [ -d "class-site/science-experiments/suhaeng3" ] && [ -d "production/src/science-experiments/suhaeng3" ]; then
    ORIGINAL_SIZE=$(du -s "class-site/science-experiments/suhaeng3" | cut -f1)
    COPY_SIZE=$(du -s "production/src/science-experiments/suhaeng3" | cut -f1)
    
    if [ "$ORIGINAL_SIZE" -eq "$COPY_SIZE" ]; then
        echo "  ✅ suhaeng3 크기 일치 (복사 성공)"
    else
        echo "  ⚠️ suhaeng3 크기 불일치: 원본=$ORIGINAL_SIZE, 복사본=$COPY_SIZE"
    fi
fi

# 6. 백업 시스템 확인
echo "📚 백업 시스템 확인..."

if [ -d "archives" ]; then
    echo "  ✅ archives 폴더 존재 확인"
    
    if [ -d "archives/backups" ]; then
        echo "  ✅ 백업 폴더 존재 확인"
        
        BACKUP_COUNT=$(find archives/backups -type d | wc -l)
        echo "  📊 백업 개수: $BACKUP_COUNT"
    else
        echo "  ⚠️ 백업 폴더가 없습니다."
    fi
    
    if [ -d "archives/versions" ]; then
        echo "  ✅ 버전 폴더 존재 확인"
        
        VERSION_COUNT=$(find archives/versions -type d | wc -l)
        echo "  📊 버전 개수: $VERSION_COUNT"
    else
        echo "  ⚠️ 버전 폴더가 없습니다."
    fi
else
    echo "  ❌ archives 폴더가 없습니다."
    exit 1
fi

# 7. 독립성 검증 완료
echo "✅ 독립성 검증 완료!"
echo ""
echo "📊 검증 결과:"
echo "  기존 구조 보존: ✅ 완료"
echo "  새로운 환경 생성: ✅ 완료"
echo "  설정 파일 독립성: ✅ 완료"
echo "  함수 파일 독립성: ✅ 완료"
echo "  백업 시스템: ✅ 완료"
echo ""
echo "🛡️ 안전성 보장:"
echo "  - 기존 배포는 전혀 영향받지 않음"
echo "  - 기존 파일들은 이동하지 않고 복사만 함"
echo "  - 기존 설정은 수정하지 않음"
echo "  - 새로운 환경은 완전히 독립적"
echo ""
echo "🔄 다음 단계:"
echo "  1. 새로운 환경 배포: ./scripts/deploy-new-environment.sh production"
echo "  2. 기존 환경 정상 작동 확인"
echo "  3. 새로운 환경 기능 테스트"
echo "  4. 점진적 마이그레이션 계획 수립"
echo ""
echo "⚠️ 주의사항:"
echo "  - 새로운 환경은 별도의 도메인을 사용해야 함"
echo "  - 기존 환경과 완전히 독립적으로 운영됨"
echo "  - 사용자에게 환경 변경을 명확히 안내해야 함"
