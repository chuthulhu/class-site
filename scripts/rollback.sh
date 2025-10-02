#!/bin/bash

# 롤백 스크립트
# 백업에서 특정 시점으로 복원

set -e

BACKUP_NAME=$1
ENVIRONMENT=$2

if [ -z "$BACKUP_NAME" ]; then
    echo "❌ 사용법: ./scripts/rollback.sh <backup_name> [environment]"
    echo ""
    echo "📋 사용 가능한 백업 목록:"
    echo "  daily 백업:"
    ls -la archives/backups/daily/ 2>/dev/null | grep -E "daily_.*" | awk '{print "    " $9}' || echo "    (백업 없음)"
    echo ""
    echo "  weekly 백업:"
    ls -la archives/backups/weekly/ 2>/dev/null | grep -E "weekly_.*" | awk '{print "    " $9}' || echo "    (백업 없음)"
    echo ""
    echo "  release 백업:"
    ls -la archives/backups/release/ 2>/dev/null | grep -E "release_.*" | awk '{print "    " $9}' || echo "    (백업 없음)"
    echo ""
    echo "  manual 백업:"
    ls -la archives/backups/manual/ 2>/dev/null | grep -E "manual_.*" | awk '{print "    " $9}' || echo "    (백업 없음)"
    exit 1
fi

echo "🔄 롤백 시작..."

# 백업 파일 찾기
BACKUP_PATH=""
for backup_type in daily weekly release manual; do
    if [ -d "archives/backups/$backup_type/$BACKUP_NAME" ]; then
        BACKUP_PATH="archives/backups/$backup_type/$BACKUP_NAME"
        break
    elif [ -f "archives/backups/$backup_type/${BACKUP_NAME}.tar.gz" ]; then
        BACKUP_PATH="archives/backups/$backup_type/${BACKUP_NAME}.tar.gz"
        break
    fi
done

if [ -z "$BACKUP_PATH" ]; then
    echo "❌ 백업을 찾을 수 없습니다: $BACKUP_NAME"
    echo ""
    echo "📋 사용 가능한 백업 목록:"
    find archives/backups -name "*$BACKUP_NAME*" 2>/dev/null || echo "  (백업 없음)"
    exit 1
fi

echo "📦 백업 경로: $BACKUP_PATH"

# 1. 롤백 전 현재 상태 백업
echo "📦 롤백 전 현재 상태 백업..."
ROLLBACK_BACKUP="archives/backups/manual/$(date +%Y%m%d_%H%M%S)_before_rollback_$BACKUP_NAME"
mkdir -p "$ROLLBACK_BACKUP"

if [ -n "$ENVIRONMENT" ]; then
    if [ -d "$ENVIRONMENT" ]; then
        cp -r "$ENVIRONMENT"/* "$ROLLBACK_BACKUP/"
        echo "  ✅ $ENVIRONMENT 백업 완료"
    else
        echo "  ⚠️  $ENVIRONMENT 폴더가 존재하지 않습니다."
    fi
else
    # 전체 프로젝트 백업
    for dir in production testing config docs scripts project; do
        if [ -d "$dir" ]; then
            cp -r "$dir" "$ROLLBACK_BACKUP/"
        fi
    done
    
    for file in netlify.toml package.json package-lock.json README.md CHANGELOG.md *.md; do
        if [ -f "$file" ]; then
            cp "$file" "$ROLLBACK_BACKUP/"
        fi
    done
fi

# 2. 백업 파일 압축 해제 (필요한 경우)
if [[ "$BACKUP_PATH" == *.tar.gz ]]; then
    echo "🗜️ 백업 압축 해제..."
    EXTRACT_DIR="archives/backups/temp_extract_$BACKUP_NAME"
    mkdir -p "$EXTRACT_DIR"
    tar -xzf "$BACKUP_PATH" -C "$EXTRACT_DIR"
    BACKUP_PATH="$EXTRACT_DIR/$BACKUP_NAME"
fi

# 3. 롤백 실행
echo "🔄 롤백 실행..."

if [ -n "$ENVIRONMENT" ]; then
    # 특정 환경만 롤백
    echo "  → $ENVIRONMENT 환경 롤백..."
    if [ -d "$ENVIRONMENT" ]; then
        rm -rf "$ENVIRONMENT"
    fi
    mkdir -p "$ENVIRONMENT"
    cp -r "$BACKUP_PATH"/* "$ENVIRONMENT/"
    echo "    ✅ $ENVIRONMENT 롤백 완료"
else
    # 전체 프로젝트 롤백
    echo "  → 전체 프로젝트 롤백..."
    
    # 기존 폴더들 백업 후 삭제
    for dir in production testing config docs scripts project; do
        if [ -d "$dir" ]; then
            rm -rf "$dir"
        fi
    done
    
    # 백업에서 복원
    for dir in production testing config docs scripts project; do
        if [ -d "$BACKUP_PATH/$dir" ]; then
            cp -r "$BACKUP_PATH/$dir" .
            echo "    → $dir 복원 완료"
        fi
    done
    
    # 설정 파일들 복원
    for file in netlify.toml package.json package-lock.json README.md CHANGELOG.md; do
        if [ -f "$BACKUP_PATH/$file" ]; then
            cp "$BACKUP_PATH/$file" .
            echo "    → $file 복원 완료"
        fi
    done
fi

# 4. 임시 파일 정리
if [ -d "archives/backups/temp_extract_$BACKUP_NAME" ]; then
    rm -rf "archives/backups/temp_extract_$BACKUP_NAME"
fi

# 5. 롤백 검증
echo "🔍 롤백 검증..."
if [ -n "$ENVIRONMENT" ]; then
    if [ -d "$ENVIRONMENT" ]; then
        echo "  ✅ $ENVIRONMENT 폴더 존재 확인"
        if [ -f "$ENVIRONMENT/netlify.toml" ]; then
            echo "  ✅ 설정 파일 존재 확인"
        fi
    else
        echo "  ❌ $ENVIRONMENT 폴더가 존재하지 않습니다."
        exit 1
    fi
else
    # 전체 프로젝트 검증
    for dir in production testing; do
        if [ -d "$dir" ]; then
            echo "  ✅ $dir 폴더 존재 확인"
        else
            echo "  ⚠️  $dir 폴더가 없습니다."
        fi
    done
fi

# 6. 롤백 완료 메시지
echo "✅ 롤백 완료!"
echo ""
echo "📊 롤백 정보:"
echo "  백업: $BACKUP_NAME"
echo "  환경: ${ENVIRONMENT:-전체}"
echo "  시간: $(date)"
echo "  롤백 전 백업: $ROLLBACK_BACKUP"
echo ""
echo "🔄 다음 단계:"
echo "  - 의존성 설치: cd $ENVIRONMENT && npm install"
echo "  - 배포: ./scripts/deploy.sh $ENVIRONMENT"
echo "  - 테스트: ./scripts/test.sh $ENVIRONMENT"
echo ""
echo "⚠️  주의사항:"
echo "  - 롤백 후 의존성 재설치가 필요할 수 있습니다."
echo "  - 데이터베이스나 외부 서비스 연동을 확인하세요."
echo "  - 문제 발생 시 롤백 전 백업으로 복원 가능합니다."
