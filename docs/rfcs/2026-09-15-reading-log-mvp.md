# RFC: Reading Log MVP

- **날짜**: 2026-09-15
- **상태**: 구현 완료 (MongoDB 전환은 별도 RFC)

## 목표
독서 기록 앱의 첫 기능(MVP)을 구현한다: 책 등록/조회/수정/삭제, 상태 관리, 별점·한줄평·인상 깊은 문장 기록, 연간 목표와 월별 독서량 통계.

## 범위
- **In scope**: 책 CRUD, 상태 변경(읽고 싶어요/읽는중/완독/중단), 별점·한줄평·인상 깊은 문장, 연간 목표 설정, 월별 독서량 통계, 로컬 JSON 데이터 계층.
- **Non-scope**: MongoDB 실제 연동, 인증, 표지 이미지, 페이지/진행률 트래킹, 배포.

## 접근 방식
- **데이터 모델**: `schemas/book.ts`(`Book`, `BookInput`, `BookUpdate`), `schemas/goal.ts`(`ReadingGoal`). react-hook-form과 API 라우트 양쪽에서 동일 zod 스키마 재사용.
- **데이터 저장**: `data/reading-log.json`에 `{ books, goals }` 저장. `lib/data/store.ts`(파일 read/write), `lib/data/books.ts`, `lib/data/goals.ts`가 CRUD 인터페이스 역할 — 추후 MongoDB로 교체 시 이 함수들의 내부 구현만 바꾸면 된다.
- **API**: `app/api/books/route.ts`(GET/POST), `app/api/books/[id]/route.ts`(GET/PATCH/DELETE), `app/api/goals/route.ts`(GET/PUT). 모두 zod `safeParse`로 입력 검증.
- **페이지**: `app/page.tsx`(목록 + 상태 필터), `app/books/new/page.tsx`(등록 폼), `app/books/[id]/page.tsx`(상세/수정/삭제), `app/stats/page.tsx`(연간 목표 진행률 + 월별 그래프).
- **차트**: 별도 라이브러리 없이 CSS(flex) 기반 커스텀 막대그래프(`components/MonthlyChart.tsx`)로 구현.

## 변경 파일
- 신규: `schemas/book.ts`, `schemas/goal.ts`, `lib/data/{store,books,goals}.ts`, `app/api/books/route.ts`, `app/api/books/[id]/route.ts`, `app/api/goals/route.ts`, `components/{StatusBadge,RatingInput,BookForm,BookCard,BookList,BookDetailEditor,GoalForm,MonthlyChart}.tsx`, `app/books/new/page.tsx`, `app/books/[id]/page.tsx`, `app/stats/page.tsx`
- 변경: `app/page.tsx`, `app/layout.tsx`(메타데이터), `.gitignore`(`/data/*.json` 추가)

## 리스크 / 특이사항
- 로컬 JSON 파일은 동시 쓰기 충돌 보호가 없음 — 단일 사용자·로컬 개발 전제이므로 이번 MVP에서는 문제 없음. MongoDB 전환 시 자연히 해소됨.
- `data/reading-log.json`은 `.gitignore` 처리되어 커밋되지 않음. 저장소를 새로 clone하면 첫 요청 시 빈 파일이 자동 생성된다(`lib/data/store.ts`의 `ensureFile`).

## 검증
- `pnpm dev`로 책 등록 → 목록 표시 → 상태 변경 → 별점/한줄평/인상 깊은 문장 편집 → 통계 페이지 반영까지 수동 확인
- `pnpm build`, `pnpm lint` 통과 확인
