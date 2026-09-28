# RFC: 로컬 JSON → MongoDB Atlas 전환

- **날짜**: 2026-09-29
- **상태**: 초안 (Draft)
- **관련 ADR**: [ADR-0001](../adr/0001-mongodb-atlas-shared-cluster.md), [ADR-0002](../adr/0002-prisma-orm.md)
- **관련 이슈**: #1 Prisma 도입 · #2 데이터 계층 교체 · #3 동적 렌더링 고정 · #4 마이그레이션 스크립트 · #5 ARCHITECTURE.md 갱신

## 목표
데이터 저장소를 로컬 JSON 파일(`data/reading-log.json`)에서 MongoDB Atlas로 옮긴다. 그러면 여러 기기(집 PC / 회사 PC)와 향후 배포 환경에서 같은 데이터를 쓸 수 있다. 이미 todo와 mini-schedule(`mini-diary` DB)이 쓰고 있는 Atlas 클러스터와 Prisma 패턴을 그대로 따라서, 이후 mini-schedule 연동에 유리한 구성을 만든다.

## 범위
- **In scope**
  - Prisma 도입 (`prisma/schema.prisma`, `lib/prisma.ts`) — mini-schedule과 같은 버전·구성
  - `lib/data/books.ts`, `lib/data/goals.ts` 내부 구현을 Prisma로 교체 (함수 시그니처 유지)
  - 기존 `data/reading-log.json` → MongoDB 1회성 마이그레이션 스크립트
  - 환경 변수 템플릿 `.env.example` 추가
  - DB 데이터를 읽는 페이지를 동적 렌더링으로 고정 (빌드 시 정적 프리렌더 방지)
  - `lib/data/store.ts`(JSON 파일 헬퍼) 제거
  - `docs/architecture/ARCHITECTURE.md` 데이터 계층 갱신
- **Non-scope** (필요 시 별도 이슈)
  - mini-schedule과의 연동 (계정 공유, 데이터 연계 등) — 별도 RFC
  - 인증 / `userId` 기반 다중 사용자 분리 (mini-schedule은 Auth.js + `User` 모델을 쓰지만, reading-log는 이번에 도입하지 않는다)
  - 날짜 필드를 `DateTime` 타입으로 변경 (현재 ISO 문자열 유지)
  - 배포 (Vercel 등)
  - 자동화 테스트 도입

## 접근 방식

### 1. 클러스터 / DB 구성 (ADR-0001)
- **새 클러스터를 만들지 않는다.** todo·mini-schedule이 쓰고 있는 기존 Atlas 클러스터를 재사용하고, DB 이름만 `reading-log`로 분리한다.
  ```
  기존 클러스터
  ├── todo
  ├── mini-diary      (mini-schedule)
  └── reading-log     ← 이번에 추가
  ```
- 연결 문자열은 mini-schedule 것을 복사해서 경로의 DB 이름만 `reading-log`로 바꾼다. DB와 컬렉션은 첫 쓰기 때 자동으로 생긴다.
- 컬렉션: `books`, `goals`

### 2. ORM (ADR-0002)
- mini-schedule과 같은 **Prisma 6.19.3**(`prisma`, `@prisma/client`)을 쓴다.
- 역할 분담: `schema.prisma`는 DB 문서의 모양을, zod(`schemas/`)는 폼·API 입력 검증을 맡는다 (zod가 입력 검증의 단일 소스라는 규칙은 유지한다).
- mini-schedule 구성을 그대로 따른다.
  - `package.json`: `"postinstall": "prisma generate"`, `"build": "prisma generate && next build"`
  - `pnpm-workspace.yaml` `allowBuilds`: `prisma`, `@prisma/client`, `@prisma/engines` → `true`
  - `lib/prisma.ts`: `globalThis` 싱글톤 캐싱 (mini-schedule `app/lib/prisma.ts`와 동일)
  - 스키마 반영: `pnpm exec prisma db push` (MongoDB는 마이그레이션 파일 없음)

### 3. 환경 변수
- `DATABASE_URL` — `.env`에 둔다. Prisma CLI는 기본적으로 `.env`만 읽기 때문이다 (mini-schedule과 동일). `.env`는 커밋하지 않는다.
- `.gitignore`가 `.env*`로 전부 무시하고 있어서, `!.env.example` 예외를 추가해야 템플릿을 커밋할 수 있다.

### 4. Prisma 스키마 — `prisma/schema.prisma`
```prisma
// id는 기존 randomUUID() 문자열을 그대로 _id로 쓴다 (@db.ObjectId 미사용 → URL /books/[id] 유지)
model Book {
  id         String   @id @map("_id")
  title      String
  author     String?
  status     String   // "want-to-read" | "reading" | "completed" | "abandoned" — 값 검증은 zod
  rating     Int?
  review     String?
  quotes     String[]
  addedAt    String   // ISO 8601 문자열 — 기존 데이터·zod 스키마와 동일
  startedAt  String?
  finishedAt String?

  @@map("books")
}

// 연도를 _id로 써서 연도당 1건을 보장한다
model Goal {
  year        Int @id @map("_id")
  targetCount Int

  @@map("goals")
}
```

### 5. 데이터 계층 교체
| 함수 | Prisma 구현 |
|---|---|
| `getBooks()` | `prisma.book.findMany({ orderBy: … })` |
| `getBookById(id)` | `prisma.book.findUnique({ where: { id } })` |
| `addBook(input)` | 기존 로직으로 객체 생성(`randomUUID()`) 후 `create` |
| `updateBook(id, patch)` | 기존 문서 조회 → 상태 전이 로직(startedAt/finishedAt) 유지 → `update` |
| `deleteBook(id)` | `deleteMany({ where: { id } })` → `count > 0` (없는 id에 대해 예외 대신 `false`) |
| `getGoal(year)` | `prisma.goal.findUnique({ where: { year } })` |
| `setGoal(year, n)` | `prisma.goal.upsert(...)` |

- **null ↔ undefined 변환**: Prisma는 값이 없는 선택 필드를 `null`로 돌려주지만, 기존 `Book` 타입(zod `optional()`)은 `undefined`를 기대한다. 그래서 데이터 계층에 `toBook()` 변환 함수를 두고 `null`을 `undefined`로 바꾼다.
- **필드 비우기**: Prisma `update`에서 `undefined`는 "변경하지 않음"을 뜻한다. 그래서 `author === ""`처럼 값을 지워야 할 때는 `null`로 넘긴다.
- **정렬**: 기존 `getBooks()`는 정렬 없이 파일 순서(= 추가 순)로 반환했다. 현재 화면 순서가 유지되도록 `orderBy: { addedAt: "asc" }`를 기본으로 하고, 구현할 때 화면과 비교해서 확인한다.
- API 라우트(`app/api/**`)와 컴포넌트는 수정하지 않는다 (시그니처가 같으므로). 페이지는 6번의 변경만 한다.

### 6. 동적 렌더링 고정
- `app/page.tsx`, `app/stats/page.tsx`, `app/books/[id]/page.tsx`는 요청마다 DB를 읽어야 한다. 빌드 때 프리렌더되면 빌드에 DB 접속이 필요해지고 데이터가 그 시점으로 굳어 버린다. 그래서 각 페이지에서 `await connection()`(`next/server`)을 호출해 동적 렌더링으로 고정한다.
- 구현 전에 `node_modules/next/dist/docs/`에서 Next.js 16의 `connection()` 사용법을 확인한다.

### 7. 마이그레이션 스크립트 — `scripts/migrate-json-to-mongo.mjs`
- `data/reading-log.json`을 읽어 `prisma.book.upsert` / `prisma.goal.upsert`로 이관한다. `_id` 기준이므로 여러 번 실행해도 중복이 생기지 않는다.
- 추가 의존성 없이 실행한다: `node --env-file=.env scripts/migrate-json-to-mongo.mjs`
- 실행 결과(건수)를 출력하고, 원본 JSON은 삭제하지 않는다 (백업으로 보관).

## 작업 단계
- [ ] mini-schedule 연결 문자열을 복사해 DB 이름을 `reading-log`로 바꾸고 `.env`에 설정 — 사용자 작업 (이 PC의 IP가 Atlas 허용 목록에 있는지 확인)
- [ ] `pnpm add @prisma/client@6.19.3` / `pnpm add -D prisma@6.19.3`, `pnpm-workspace.yaml` `allowBuilds` 추가, `package.json` 스크립트 추가
- [ ] `.env.example` 추가 (자리표시자만) + `.gitignore`에 `!.env.example` 예외 추가
- [ ] `prisma/schema.prisma` 작성, `pnpm exec prisma db push`
- [ ] `lib/prisma.ts` 싱글톤 작성
- [ ] `lib/data/books.ts` Prisma 구현으로 교체 (`toBook()` 변환 포함)
- [ ] `lib/data/goals.ts` Prisma 구현으로 교체
- [ ] 페이지 3곳 동적 렌더링 고정 (`connection()`)
- [ ] `scripts/migrate-json-to-mongo.mjs` 작성 및 기존 데이터 이관
- [ ] `lib/data/store.ts` 제거
- [ ] `docs/architecture/ARCHITECTURE.md` 데이터 계층 · 환경 변수 섹션 갱신
- [ ] 검증 (아래) 후 PR

## 변경 파일
- 신규: `prisma/schema.prisma`, `lib/prisma.ts`, `scripts/migrate-json-to-mongo.mjs`, `.env.example`, `docs/adr/0001-mongodb-atlas-shared-cluster.md`, `docs/adr/0002-prisma-orm.md`
- 변경: `lib/data/books.ts`, `lib/data/goals.ts`, `app/page.tsx`, `app/stats/page.tsx`, `app/books/[id]/page.tsx`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.gitignore`, `docs/architecture/ARCHITECTURE.md`
- 삭제: `lib/data/store.ts`

## 리스크 / 특이사항
- **시크릿 노출**: 연결 문자열은 `.env`에만 둔다. `.env.example`과 문서에는 `mongodb+srv://<사용자>:<비밀번호>@<클러스터>/reading-log?...` 같은 자리표시자만 쓴다 (CLAUDE.md 6번).
- **클러스터 공유**: 다른 앱의 DB(`todo`, `mini-diary`)와 같은 클러스터에 있다. 연결 문자열의 DB 이름을 잘못 적으면 다른 앱 DB에 컬렉션이 생길 수 있으므로, `db push` 전에 DB 이름을 반드시 확인한다.
- **오프라인 개발 불가**: JSON 폴백을 두지 않으므로 `DATABASE_URL` 없이는 앱이 동작하지 않는다.
- **Atlas IP 허용 목록**: 기기마다 IP가 다르면 접속이 막힐 수 있다 (mini-schedule에서 이미 등록한 기기는 그대로 쓸 수 있다).
- **Free 티어(M0) 제약**: 세 앱이 용량과 연결 수를 나눠 쓴다. 개인용 규모에서는 문제없다.
- **스키마 이중 정의**: 모델이 `schema.prisma`와 zod 양쪽에 있다. 필드를 추가하거나 바꿀 때는 두 파일을 함께 수정해야 한다.

## 검증
- `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build` 통과
- `pnpm build` 출력에서 `/`, `/stats`, `/books/[id]`가 동적(ƒ)으로 표시되는지 확인
- 마이그레이션 스크립트 실행 후 Atlas UI에서 `reading-log` DB의 문서 수가 JSON 건수와 같은지 확인. 한 번 더 실행해도 건수가 변하지 않는지 확인. 다른 DB(`todo`, `mini-diary`)에 변화가 없는지 확인
- `pnpm dev`로 수동 확인: 책 등록 → 목록 → 상태 변경(startedAt/finishedAt 자동 기록) → 별점/한줄평/문장 편집 → 저자 비우기 → 삭제 → 통계/목표 설정
- 다른 기기(또는 dev 서버 재시작 후)에서 같은 데이터가 보이는지 확인
