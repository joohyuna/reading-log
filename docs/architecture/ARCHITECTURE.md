# ARCHITECTURE.md

현재 시스템 구조 스냅샷. 구조가 바뀔 때마다 갱신한다.

## 개요
독서 기록 웹 앱. Next.js App Router 기반 풀스택 구조. MVP 기능(책 CRUD, 상태 관리, 별점/한줄평/인상 깊은 문장, 연간 목표·월별 통계) 구현 완료. 데이터는 현재 로컬 JSON 파일, 추후 MongoDB로 교체 예정(`docs/rfcs/2026-09-15-reading-log-mvp.md` 참고).

## 스택
- Next.js 16.3.5 (App Router, Turbopack)
- React 19.2.8
- TypeScript 5.9
- Tailwind CSS v4 (CSS 기반 설정, `app/globals.css`에서 `@import "tailwindcss"`)
- react-hook-form 7 + zod 4 + @hookform/resolvers 5 (폼 · API 공용 검증)
- pnpm (workspace 단일 패키지)

## 디렉토리 구조
```
app/            # App Router 라우트, 레이아웃, 전역 스타일
components/     # 공용 UI 컴포넌트
lib/            # 유틸리티
schemas/        # zod 스키마 (폼 + API 공용)
docs/           # PRD / ADR / RFC / 아키텍처 문서
public/         # 정적 파일
```

## 데이터 계층
- 로컬 JSON 파일(`data/reading-log.json`, git-ignored) — `{ books: Book[], goals: ReadingGoal[] }`
- `lib/data/store.ts` — 파일 read/write 저수준 헬퍼
- `lib/data/books.ts`, `lib/data/goals.ts` — CRUD 함수(추후 MongoDB로 내부 구현만 교체 예정)
- API: `app/api/books/route.ts`, `app/api/books/[id]/route.ts`, `app/api/goals/route.ts` (Route Handler, zod 검증)

## 인증
TODO — 미정.

## 향후 고려사항
- **MongoDB 전환 (진행 예정)**: `docs/rfcs/2026-09-29-mongodb-migration.md` — todo·mini-schedule이 쓰는 기존 Atlas 클러스터에 `reading-log` DB를 추가하고, Prisma로 접근한다 (ADR-0001, ADR-0002).
- **mini-schedule 연동**: 사용자의 별도 프로젝트 "mini-schedule"(`lecture-mini-schedule`)은 이미 MongoDB Atlas(`mini-diary` DB) + Prisma + Auth.js(`User` 모델)를 쓴다. 연동 방식(계정 공유/데이터 연계 등)은 아직 미정 — reading-log DB 전환 후 별도 RFC에서 논의한다.

## 참고
- Next.js 16은 API가 이전 버전과 다를 수 있어, 작업 전 `node_modules/next/dist/docs/`의 문서를 확인할 것 (`AGENTS.md` 참고).
