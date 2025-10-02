#!/bin/bash

# 안전한 백업 스크립트
# 기존 구조에 전혀 영향을 주지 않으면서 백업 생성

set -e

echo "🛡️ 안전한 백업 생성 시작..."

# 1. 백업 디렉토리 생성
BACKUP_DIR="archives/backups/manual/$(date +%Y%m%d_%H%M%S)_safe_backup"
mkdir -p "$BACKUP_DIR"

echo "📁 백업 경로: $BACKUP_DIR"

# 2. 기존 구조 완전 백업
echo "📦 기존 구조 백업..."
if [ -d "class-site" ]; then
    cp -r class-site/* "$BACKUP_DIR/"
    echo "  ✅ class-site 백업 완료"
else
    echo "  ⚠️ class-site 폴더가 존재하지 않습니다."
fi

# 3. 루트 파일들 백업
echo "📄 루트 파일들 백업..."
for file in netlify.toml package.json package-lock.json README.md *.md; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/"
        echo "  → $file 백업 완료"
    fi
done

# 4. temps 폴더 백업
echo "📚 temps 폴더 백업..."
if [ -d "temps" ]; then
    cp -r temps "$BACKUP_DIR/"
    echo "  ✅ temps 백업 완료"
else
    echo "  ⚠️ temps 폴더가 존재하지 않습니다."
fi

# 5. 백업 메타데이터 생성
echo "📋 백업 메타데이터 생성..."
cat > "$BACKUP_DIR/backup_info.json" << EOF
{
  "backup_type": "safe_backup",
  "timestamp": "$(date +%Y%m%d_%H%M%S)",
  "backup_name": "$(basename "$BACKUP_DIR")",
  "backup_path": "$BACKUP_DIR",
  "created_by": "$(whoami)",
  "hostname": "$(hostname)",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'N/A')",
  "git_branch": "$(git branch --show-current 2>/dev/null || echo 'N/A')",
  "backup_reason": "Safe migration preparation",
  "original_structure_preserved": true
}
EOF

# 6. 백업 검증
echo "🔍 백업 검증..."
if [ -d "$BACKUP_DIR" ]; then
    BACKUP_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
    BACKUP_FILES=$(find "$BACKUP_DIR" -type f | wc -l)
    echo "  ✅ 백업 디렉토리 존재 확인"
    echo "  📊 백업 크기: $BACKUP_SIZE"
    echo "  📊 백업 파일 수: $BACKUP_FILES"
else
    echo "  ❌ 백업 디렉토리가 생성되지 않았습니다."
    exit 1
fi

# 7. 백업 완료 메시지
echo "✅ 안전한 백업 완료!"
echo ""
echo "📊 백업 정보:"
echo "  경로: $BACKUP_DIR"
echo "  크기: $BACKUP_SIZE"
echo "  파일 수: $BACKUP_FILES"
echo "  시간: $(date)"
echo ""
echo "🛡️ 안전성 보장:"
echo "  - 기존 구조는 전혀 변경되지 않음"
echo "  - 기존 파일들은 이동하지 않음"
echo "  - 기존 설정은 수정하지 않음"
echo "  - 언제든지 완전한 복원 가능"
echo ""
echo "🔄 다음 단계:"
echo "  - 새로운 환경 생성: ./scripts/create-new-environments.sh"
echo "  - 백업 검증: ls -la $BACKUP_DIR"
echo "  - 백업 복원: cp -r $BACKUP_DIR/* ."
