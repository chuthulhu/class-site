# 배포 가이드

## Netlify 설정

1. 저장소 연결: chuthulhu/class-site
2. 기본 디렉터리: class-site
3. Functions 디렉터리: class-site/netlify/functions (netlify.toml에 설정되어 있음)
4. 환경 변수: docs/configuration.md 참고

## 로컬 개발

Prerequisites: Node.js LTS, pnpm 또는 npm

설치 및 실행
```bash
pnpm install # 또는 npm install
pnpm dev     # 또는 npm run dev
```

Netlify Functions 로컬 실행
```bash
netlify dev
```

## 배포 팁

- 캐시 문제 발생 시 Netlify에서 Clear cache and deploy 실행
- netlify.toml은 UTF-8(BOM 없음) 유지
- Functions는 ESM 모드로 빌드되며 esbuild 번들링이 적용됩니다
