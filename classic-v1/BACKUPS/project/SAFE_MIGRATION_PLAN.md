# 안전한 마이그레이션 계획

## 🎯 목표

기존 배포 환경에 **전혀 영향을 주지 않으면서** 새로운 구조를 구축하는 안전한 마이그레이션 계획

## 🚨 현재 배포 환경 보호 원칙

### 1. 기존 구조 유지
- 현재 `class-site/` 구조는 **그대로 유지**
- 기존 웹 주소와 경로는 **변경하지 않음**
- 현재 `netlify.toml` 설정은 **보존**

### 2. 추가 구조만 생성
- 새로운 폴더들을 **추가로 생성**만 함
- 기존 파일들은 **이동하지 않고 복사**만 함
- 기존 설정은 **수정하지 않음**

## 📁 안전한 새로운 구조

```
class-site/                    # 기존 구조 그대로 유지
├── science-experiments/       # 기존 경로 유지
│   ├── suhaeng1/            # 기존 경로 유지
│   ├── suhaeng2/            # 기존 경로 유지
│   ├── suhaeng3/            # 기존 경로 유지
│   └── suhaeng3-test/       # 기존 경로 유지
├── netlify/                  # 기존 구조 유지
│   └── functions/           # 기존 함수들 유지
└── netlify.toml             # 기존 설정 유지

# 새로운 추가 구조 (기존에 영향 없음)
├── 📦 production/           # 새로운 운영 환경 (별도 배포)
├── 🧪 testing/             # 새로운 테스트 환경 (별도 배포)
├── 📚 archives/            # 백업 및 아카이브
├── 📖 docs/               # 문서화
├── 🔧 scripts/            # 유틸리티 스크립트
├── ⚙️ config/             # 설정 파일들
└── 📋 project/            # 프로젝트 관리
```

## 🔄 안전한 마이그레이션 단계

### Phase 1: 백업 및 아카이브 구축 (영향 없음)
```bash
# 1. 현재 상태 완전 백업
mkdir -p archives/backups/manual/$(date +%Y%m%d_%H%M%S)_before_migration
cp -r class-site/* archives/backups/manual/$(date +%Y%m%d_%H%M%S)_before_migration/

# 2. 버전별 아카이브 생성
mkdir -p archives/versions/v1.0.0_current
cp -r class-site/* archives/versions/v1.0.0_current/

# 3. temps 폴더 정리
mkdir -p archives/temps
cp -r temps/* archives/temps/
```

### Phase 2: 새로운 환경 구축 (기존에 영향 없음)
```bash
# 1. 새로운 환경 폴더 생성
mkdir -p production/src/science-experiments
mkdir -p testing/src/science-experiments

# 2. 기존 파일 복사 (이동하지 않음)
cp -r class-site/science-experiments/suhaeng3 production/src/science-experiments/
cp -r class-site/science-experiments/suhaeng3-test testing/src/science-experiments/

# 3. 함수들 복사
cp -r class-site/netlify/functions production/
cp -r class-site/netlify/functions testing/

# 4. 모듈들 복사
cp -r class-site/science-experiments/modules production/src/
cp -r class-site/science-experiments/modules testing/src/
```

### Phase 3: 독립적인 설정 생성 (기존에 영향 없음)
```bash
# 1. 환경별 독립적인 netlify.toml 생성
# production/netlify.toml - 별도 도메인/경로 사용
# testing/netlify.toml - 별도 도메인/경로 사용

# 2. 환경별 package.json 생성
cp class-site/package.json production/
cp class-site/package.json testing/
```

## 🌐 배포 전략

### 현재 배포 (기존 유지)
- **도메인**: 기존 웹 주소 그대로 유지
- **경로**: `/science-experiments/suhaeng3/` 그대로 유지
- **설정**: 기존 `netlify.toml` 그대로 사용
- **함수**: 기존 `submit.js`, `download.js` 그대로 사용

### 새로운 배포 (별도 환경)
- **Production**: `production.your-domain.com` 또는 별도 서브도메인
- **Testing**: `testing.your-domain.com` 또는 별도 서브도메인
- **경로**: 각각 독립적인 경로 구조
- **설정**: 각각 독립적인 `netlify.toml`
- **함수**: 각각 독립적인 함수들

## 🔧 안전한 스크립트

### 1. 백업 전용 스크립트
```bash
#!/bin/bash
# scripts/safe-backup.sh

echo "🛡️ 안전한 백업 생성..."

# 현재 상태 백업
BACKUP_DIR="archives/backups/manual/$(date +%Y%m%d_%H%M%S)_safe_backup"
mkdir -p "$BACKUP_DIR"

# 기존 구조 완전 백업
cp -r class-site/* "$BACKUP_DIR/"

echo "✅ 백업 완료: $BACKUP_DIR"
echo "📊 백업 크기: $(du -sh "$BACKUP_DIR" | cut -f1)"
```

### 2. 새로운 환경 생성 스크립트
```bash
#!/bin/bash
# scripts/create-new-environments.sh

echo "🏗️ 새로운 환경 생성 (기존에 영향 없음)..."

# 새로운 환경 폴더 생성
mkdir -p production/src/science-experiments
mkdir -p testing/src/science-experiments
mkdir -p archives/{versions,temps,backups/{daily,weekly,releases}}
mkdir -p docs/{deployment,testing,api,user-guides}
mkdir -p scripts config project

# 기존 파일 복사 (이동하지 않음)
echo "📦 기존 파일 복사..."
cp -r class-site/science-experiments/suhaeng3 production/src/science-experiments/
cp -r class-site/science-experiments/suhaeng3-test testing/src/science-experiments/
cp -r class-site/netlify/functions production/
cp -r class-site/netlify/functions testing/

echo "✅ 새로운 환경 생성 완료"
echo "📁 기존 구조는 그대로 유지됨"
```

### 3. 독립적인 배포 스크립트
```bash
#!/bin/bash
# scripts/deploy-new-environment.sh

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
    echo "❌ 사용법: ./scripts/deploy-new-environment.sh <environment>"
    echo "   환경: production, testing"
    exit 1
fi

echo "🚀 $ENVIRONMENT 환경 배포 (기존에 영향 없음)..."

# 새로운 환경으로 이동
cd "$ENVIRONMENT"

# 독립적인 배포
if command -v netlify &> /dev/null; then
    netlify deploy --prod --message "Deploy new $ENVIRONMENT environment"
else
    echo "⚠️ Netlify CLI가 설치되지 않았습니다."
    echo "수동으로 배포를 진행하세요."
fi

cd ..

echo "✅ $ENVIRONMENT 환경 배포 완료"
echo "🌐 기존 배포는 전혀 영향받지 않음"
```

## 🛡️ 안전성 보장

### 1. 기존 구조 보호
- 현재 `class-site/` 구조는 **절대 변경하지 않음**
- 기존 파일들은 **이동하지 않고 복사만 함**
- 기존 설정은 **수정하지 않음**

### 2. 독립적인 환경
- 새로운 환경들은 **완전히 독립적**
- 별도의 도메인/경로 사용
- 별도의 설정 파일 사용

### 3. 롤백 가능성
- 언제든지 새로운 구조를 **완전히 삭제 가능**
- 기존 구조는 **전혀 변경되지 않음**
- 백업을 통한 **완전한 복원 가능**

## 📋 구현 체크리스트

### Phase 1: 백업 (영향 없음)
- [ ] 현재 상태 완전 백업
- [ ] 버전별 아카이브 생성
- [ ] temps 폴더 정리

### Phase 2: 새로운 환경 구축 (영향 없음)
- [ ] 새로운 폴더 구조 생성
- [ ] 기존 파일 복사 (이동하지 않음)
- [ ] 독립적인 설정 파일 생성

### Phase 3: 독립적인 배포 (영향 없음)
- [ ] 새로운 환경별 배포 설정
- [ ] 별도 도메인/경로 설정
- [ ] 독립적인 함수 배포

### Phase 4: 검증 (영향 없음)
- [ ] 기존 배포 정상 작동 확인
- [ ] 새로운 환경 정상 작동 확인
- [ ] 독립성 검증

## 🎯 예상 결과

### 기존 배포 환경
- **상태**: 전혀 변경되지 않음
- **URL**: 기존 웹 주소 그대로 유지
- **기능**: 기존 기능 그대로 유지
- **사용자**: 기존 사용자에게 영향 없음

### 새로운 환경
- **Production**: 안정화된 운영 환경
- **Testing**: 개발 및 테스트 환경
- **Archives**: 체계적인 백업 시스템
- **Scripts**: 자동화 도구들

이러한 방식으로 기존 배포 환경에 **전혀 영향을 주지 않으면서** 새로운 구조를 안전하게 구축할 수 있습니다! 🛡️
