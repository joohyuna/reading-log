# ARCHITECTURE.md

현재 시스템 구조 스냅샷. 구조가 바뀔 때마다 갱신한다.

## 개요
독서 기록 웹 앱. Next.js App Router 기반 풀스택 구조. MVP 기능(책 CRUD, 상태 관리, 별점/한줄평/인상 깊은 문장, 연간 목표·월별 통계) 구현 완료. 데이터는 MongoDB Atlas에 Prisma로 저장한다(`docs/rfcs/2026-09-29-mongodb-migration.md` 참고).

## 스택
- Next.js 16.3.5 (App Router, Turbopack)
- React 19.2.8
- TypeScript 5.9
- Tailwind CSS v4 (CSS 기반 설정, `app/globals.css`에서 `@import "tailwindcss"`)
- react-hook-form 7 + zod 4 + @hookform/resolvers 5 (폼 · API 공용 검증)
- MongoDB Atlas + Prisma 6.19.3 (mini-schedule과 동일 버전)
- pnpm (workspace 단일 패키지)

## 디렉토리 구조
```
app/            # App Router 라우트, 레이아웃, 전역 스타일
components/     # 공용 UI 컴포넌트
lib/            # 유틸리티, Prisma 클라이언트(lib/prisma.ts), 데이터 계층(lib/data/)
prisma/         # Prisma 스키마 (schema.prisma)
schemas/        # zod 스키마 (폼 + API 공용)
scripts/        # 1회성 운영 스크립트 (JSON → MongoDB 이관)
docs/           # PRD / ADR / RFC / 아키텍처 문서
public/         # 정적 파일
```

## 데이터 계층
- **저장소**: MongoDB Atlas — todo·mini-schedule과 **같은 클러스터**, DB 이름만 `reading-log`로 분리 (ADR-0001)
  ```
  클러스터
  ├── todo
  ├── mini-diary      (mini-schedule)
  └── reading-log     ← 이 앱 (컬렉션: books, goals)
  ```
- **ORM**: Prisma (ADR-0002). `prisma/schema.prisma`는 DB 문서 모양, zod(`schemas/`)는 폼·API 입력 검증 담당 — 필드 변경 시 양쪽을 함께 수정한다.
  - `Book`: `_id` = `randomUUID()` 문자열 (URL `/books/[id]`에 그대로 사용), 날짜 필드는 ISO 8601 문자열
  - `Goal`: `_id` = 연도(Int) → 연도당 1건
- `lib/prisma.ts` — PrismaClient `globalThis` 싱글톤 (dev HMR 시 커넥션 증가 방지)
- `lib/data/books.ts`, `lib/data/goals.ts` — CRUD 함수. Prisma 결과를 zod 기반 타입(`Book`, `ReadingGoal`)으로 변환해 반환 (`null` → `undefined`)
- API: `app/api/books/route.ts`, `app/api/books/[id]/route.ts`, `app/api/goals/route.ts` (Route Handler, zod 검증)
- DB를 읽는 페이지(`/`, `/stats`, `/books/[id]`)는 `connection()`으로 요청 시 렌더링 (빌드 시 프리렌더 금지)

## 환경 변수 / 운영
- `DATABASE_URL` — `.env`에 설정 (Prisma CLI가 `.env`만 읽음). 템플릿: `.env.example` (자리표시자만)
- 스키마 반영: `pnpm exec prisma db push` (MongoDB는 마이그레이션 파일 없음). 반영 전 연결 문자열 DB 이름이 `reading-log`인지 확인
- 클라이언트 생성: `prisma generate` — `postinstall`, `build`에서 자동 실행
- 기존 JSON 데이터 이관: `node --env-file=.env scripts/migrate-json-to-mongo.mjs [JSON 경로]` (`_id` 기준 upsert, 재실행 안전, DB 이름 검사 포함). 예전 `data/reading-log.json`은 백업으로만 남는다 (git-ignored)
- Windows에서 dev 서버 실행 중에는 Prisma 엔진 파일이 잠겨 `pnpm build`(`prisma generate`)가 `EPERM`으로 실패한다 — 빌드 전 dev 서버를 종료할 것

## 인증
TODO — 미정. (단일 사용자 전제, `userId` 구분 없음)

## 향후 고려사항
- **mini-schedule 연동**: 사용자의 별도 프로젝트 "mini-schedule"(`lecture-mini-schedule`)은 MongoDB Atlas(`mini-diary` DB) + Prisma + Auth.js(`User` 모델)를 쓴다. 같은 클러스터·같은 ORM을 쓰도록 맞춰 두었으며, 연동 방식(계정 공유/데이터 연계 등)은 별도 RFC에서 논의한다.

## 참고
- Next.js 16은 API가 이전 버전과 다를 수 있어, 작업 전 `node_modules/next/dist/docs/`의 문서를 확인할 것 (`AGENTS.md` 참고).
