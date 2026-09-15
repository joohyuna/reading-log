# RFC: 프로젝트 초기 세팅

- **날짜**: 2026-09-15
- **상태**: 완료

## 목표
Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind CSS v4 + react-hook-form/zod + pnpm 스택으로 독서 기록 앱의 초기 프로젝트 뼈대를 구성한다.

## 범위
- **In scope**: Next.js 스캐폴딩, 핵심 의존성 설치, 기본 폴더 구조(`components/`, `lib/`, `schemas/`), `docs/` 문서 구조 생성, `CLAUDE.md` 갱신, 로컬 실행/빌드/린트 검증.
- **Non-scope**: 도서 기록 CRUD 기능, DB/ORM 선택, 인증, 배포/CI, 테스트 전략. 별도 RFC로 다룬다.

## 접근 방식
1. `pnpm dlx create-next-app@latest .`로 스캐폴딩 (TypeScript, Tailwind, ESLint, App Router, Turbopack, `@/*` alias)
   - 기존 `CLAUDE.md`와의 파일 충돌로 인해 임시로 상위 폴더로 옮겼다가 스캐폴딩 후 복원함.
2. `pnpm add react-hook-form zod @hookform/resolvers`
3. `components/`, `lib/`, `schemas/` 폴더 생성
4. `docs/{prd,architecture,adr,rfcs}` 문서 구조 생성, `ARCHITECTURE.md` 초안 작성
5. `CLAUDE.md`의 개발 명령어 / 디렉토리 구조 TODO 갱신

## 변경 파일
- 신규 생성: `app/*`(Next.js 기본 템플릿), `package.json`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `next.config.ts`, `AGENTS.md`(Next.js 자동 생성), `components/`, `lib/`, `schemas/`, `docs/**`
- 갱신: `CLAUDE.md`

## 리스크 / 특이사항
- `AGENTS.md`는 `next dev` 실행 시 Next.js가 자동으로 재생성하는 파일로, "이 버전의 Next.js는 학습 데이터와 다를 수 있으니 `node_modules/next/dist/docs/`를 먼저 확인하라"는 경고를 담고 있다. 이후 Next.js API 관련 작업 시 반드시 참고할 것.
- Tailwind v4는 `tailwind.config.js` 없이 `app/globals.css`의 `@import "tailwindcss"` + `@theme inline`으로 설정된다 (기존 v3 방식과 다름).

## 검증
- `pnpm dev` — 로컬 서버 및 기본 홈페이지 정상 표시 확인
- `pnpm build` — 프로덕션 빌드 성공 확인
- `pnpm lint` — 린트 통과 확인
