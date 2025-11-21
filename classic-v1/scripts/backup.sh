#!/bin/bash

# 백업 스크립트
# 자동화된 백업 시스템

set -e

BACKUP_TYPE=$1
ENVIRONMENT=$2

if [ -z "$BACKUP_TYPE" ]; then
    echo "❌ 사용법: ./scripts/backup.sh <type> [environment]"
    echo "   타입: daily, weekly, release, manual"
    echo "   환경: production, testing (선택사항)"
    exit 1
fi

echo "📦 백업 시작..."

# 백업 디렉토리 생성
BACKUP_DIR="archives/backups/$BACKUP_TYPE"
mkdir -p "$BACKUP_DIR"

# 타임스탬프 생성
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="${TIMESTAMP}_${BACKUP_TYPE}"

if [ -n "$ENVIRONMENT" ]; then
    BACKUP_NAME="${BACKUP_NAME}_${ENVIRONMENT}"
fi

FULL_BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
mkdir -p "$FULL_BACKUP_PATH"

echo "📁 백업 경로: $FULL_BACKUP_PATH"

# 1. 환경별 백업
if [ -n "$ENVIRONMENT" ]; then
    echo "  → $ENVIRONMENT 환경 백업..."
    if [ -d "$ENVIRONMENT" ]; then
        cp -r "$ENVIRONMENT"/* "$FULL_BACKUP_PATH/"
        echo "    ✅ $ENVIRONMENT 백업 완료"
    else
        echo "    ⚠️  $ENVIRONMENT 폴더가 존재하지 않습니다."
    fi
else
    # 2. 전체 프로젝트 백업
    echo "  → 전체 프로젝트 백업..."
    
    # 주요 폴더들 백업
    for dir in production testing config docs scripts project; do
        if [ -d "$dir" ]; then
            echo "    → $dir 백업..."
            cp -r "$dir" "$FULL_BACKUP_PATH/"
        fi
    done
    
    # 설정 파일들 백업
    for file in netlify.toml package.json package-lock.json; do
        if [ -f "$file" ]; then
            echo "    → $file 백업..."
            cp "$file" "$FULL_BACKUP_PATH/"
        fi
    done
    
    # 루트 문서들 백업
    for file in README.md CHANGELOG.md *.md; do
        if [ -f "$file" ]; then
            echo "    → $file 백업..."
            cp "$file" "$FULL_BACKUP_PATH/"
        fi
    done
fi

# 3. 백업 메타데이터 생성
echo "📋 백업 메타데이터 생성..."
cat > "$FULL_BACKUP_PATH/backup_info.json" << EOF
{
  "backup_type": "$BACKUP_TYPE",
  "environment": "$ENVIRONMENT",
  "timestamp": "$TIMESTAMP",
  "backup_name": "$BACKUP_NAME",
  "backup_path": "$FULL_BACKUP_PATH",
  "created_by": "$(whoami)",
  "hostname": "$(hostname)",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'N/A')",
  "git_branch": "$(git branch --show-current 2>/dev/null || echo 'N/A')"
}
EOF

# 4. 백업 압축 (선택사항)
if [ "$BACKUP_TYPE" = "release" ] || [ "$BACKUP_TYPE" = "weekly" ]; then
    echo "🗜️ 백업 압축..."
    cd "$BACKUP_DIR"
    tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
    rm -rf "$BACKUP_NAME"
    echo "  ✅ 압축 완료: ${BACKUP_NAME}.tar.gz"
    cd ..
fi

# 5. 오래된 백업 정리
echo "🧹 오래된 백업 정리..."
case "$BACKUP_TYPE" in
    "daily")
        # 7일 이상 된 daily 백업 삭제
        find "$BACKUP_DIR" -name "*_daily_*" -mtime +7 -delete
        ;;
    "weekly")
        # 4주 이상 된 weekly 백업 삭제
        find "$BACKUP_DIR" -name "*_weekly_*" -mtime +28 -delete
        ;;
    "release")
        # release 백업은 보관 (수동 삭제)
        echo "  ℹ️  Release 백업은 수동으로 관리됩니다."
        ;;
esac

# 6. 백업 완료 메시지
echo "✅ 백업 완료!"
echo ""
echo "📊 백업 정보:"
echo "  타입: $BACKUP_TYPE"
echo "  환경: ${ENVIRONMENT:-전체}"
echo "  이름: $BACKUP_NAME"
echo "  경로: $FULL_BACKUP_PATH"
echo "  크기: $(du -sh "$FULL_BACKUP_PATH" 2>/dev/null | cut -f1 || echo 'N/A')"
echo "  시간: $(date)"
echo ""
echo "🔄 다음 단계:"
echo "  - 백업 검증: ls -la $FULL_BACKUP_PATH"
echo "  - 백업 복원: ./scripts/rollback.sh $BACKUP_NAME"
echo "  - 백업 목록: ls -la $BACKUP_DIR"
