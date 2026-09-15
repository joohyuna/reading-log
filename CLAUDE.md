# CLAUDE.md

이 파일은 Claude Code가 이 프로젝트에서 작업할 때 따라야 하는 규칙과 문서 구조를 정의합니다.

---

## 1. 프로젝트 개요

- **목적**: 독서 기록(reading log) 웹 앱. 읽은 책을 기록하고 관리하는 기능을 중심으로 한다.
- **기술 스택**:
  - **프레임워크**: Next.js 16 (App Router, Turbopack)
  - **UI**: React 19
  - **언어**: TypeScript
  - **스타일링**: Tailwind CSS v4
  - **폼 / 검증**: react-hook-form + zod — zod 스키마는 폼 검증과 API 요청 검증에 공용으로 재사용한다
  - **패키지 매니저**: pnpm (npm/yarn 대신 항상 `pnpm` 명령 사용)
- **주요 진입점**: `app/layout.tsx`, `app/page.tsx`

### 개발 명령어
```bash
pnpm install     # 의존성 설치
pnpm dev         # 개발 서버 (Turbopack)
pnpm build       # 프로덕션 빌드
pnpm start       # 프로덕션 서버 실행
pnpm lint        # 린트 (eslint)
```

### Next.js 16 관련 주의사항
Next.js 16은 학습 데이터 시점 대비 API/컨벤션이 달라졌을 수 있다. 작업 전 저장소 루트의 `AGENTS.md`(Next.js가 `next dev` 실행 시 자동 생성/갱신)와 `node_modules/next/dist/docs/`의 문서를 확인한다.

---

## 2. 문서 구조 (Documentation Structure)

작업 성격에 따라 아래 위치에 문서를 만들고 참조합니다.

```
docs/
├── prd/            # 제품 요구사항 (Why / What) — 기능 작업 전 확인
├── architecture/
│   └── ARCHITECTURE.md   # 현재 시스템 구조 스냅샷 — 최신 상태 유지
├── adr/            # 개별 기술 결정 기록 (append-only)
└── rfcs/           # 기능별 구현 계획 (Plan 모드 산출물)
```

| 문서 | 질문 | 갱신 빈도 |
|---|---|---|
| PRD | 무엇을/왜 만드는가 (제품 관점) | 기능 시작 시 1회 |
| ARCHITECTURE.md | 전체 구조가 지금 어떤가 | 구조 변경 시마다 |
| ADR | 이 결정을 왜 이렇게 내렸나 | append-only, 결정마다 새 파일 |
| RFC/Plan | 이번 작업을 어떻게 구현하나 | 작업 단위마다 |

---

## 3. 워크플로우 (신규 기능 작업 시)

1. `docs/prd/`에 관련 PRD가 있는지 먼저 확인한다. 없으면 요구사항을 먼저 명확히 한다.
2. Plan 모드로 기술 접근 방식을 논의하고, 결과를 `docs/rfcs/<기능명>.md`로 정리한다.
   - RFC에는 목표, 범위(Scope/Non-scope), 접근 방식, 체크박스 작업 단계, 변경 파일 목록, 리스크, 검증 방법을 포함한다.
3. RFC 안에서 중요한 기술적 갈림길(A vs B 선택 등)이 있으면 `docs/adr/000X-제목.md`로 별도 분리한다.
   - ADR 포맷: Status / Context / Decision / Consequences
   - 결정이 바뀌면 새 ADR을 만들고 이전 ADR의 Status를 `Superseded by ADR-00XX`로 변경한다. 기존 ADR은 수정하지 않는다.
4. 작업이 전체 구조에 영향을 준다면 `docs/architecture/ARCHITECTURE.md`를 갱신한다.
5. 작업 완료 후 관련 GitHub Issue 상태를 갱신한다 (아래 4번 참고).

---

## 4. GitHub Issue 워크플로우

- 작업 시작 전: `gh issue list`로 관련 이슈가 이미 있는지 확인한다.
- RFC 완료 후: 작업을 단위별로 쪼개서 `gh issue create`로 등록한다.
- 커밋/PR에는 관련 이슈를 `Closes #N` 형식으로 연결한다.
- 라벨 규칙: `bug` / `feature` / `refactor` / `chore` 중 최소 하나를 지정한다.

---

## 5. 코드 스타일 / 컨벤션

- **커밋 메시지 규칙**: TODO (예: Conventional Commits — `feat:`, `fix:`, `refactor:`)
- **브랜치 전략**: TODO (예: `feature/`, `fix/` 프리픽스 + PR 필수)
- **테스트**: TODO (예: 새 기능은 반드시 단위 테스트 동반, `pnpm test`로 확인)
- **린트/포맷**: TODO (예: 커밋 전 `pnpm lint` 통과 필수)
- **폼 · 검증 규칙**: zod 스키마를 단일 소스로 정의하고, react-hook-form(`@hookform/resolvers/zod`)과 API 라우트(Route Handler)의 입력 검증 양쪽에서 재사용한다. 스키마는 `schemas/`에 둔다. 세부 네이밍 규칙은 TODO.
- **디렉토리 구조**:
  ```
  app/            # App Router 라우트, 레이아웃, 전역 스타일
  components/     # 공용 UI 컴포넌트
  lib/            # 유틸리티
  schemas/        # zod 스키마 (폼 + API 공용)
  docs/           # PRD / ADR / RFC / 아키텍처 문서
  public/         # 정적 파일
  ```
- **데이터 저장 방식**: TODO (DB, ORM 등)
- **디자인 시스템**: TODO (UI 컴포넌트 라이브러리 사용 여부)

---

## 6. 하지 말아야 할 것 (Guardrails)

- `docs/adr/`에 있는 파일은 직접 수정하지 않는다 (append-only).
- 사람 확인 없이 `main`/`master` 브랜치에 직접 푸시하지 않는다.
- `.env`의 실제 값(`DATABASE_URL`, `AUTH_SECRET`)이나 그 외 시크릿이 포함된 파일은 커밋하지 않는다. 템플릿은 `.env.example`에만 자리표시자로 남긴다.
- `PLAN.md`/`README.md` 같은 서술형 문서에도 실제 자격증명 관련 값(DB 사용자명, 호스트명, 연결 문자열 등)을 적지 않는다 — 비밀번호만 가리고 사용자명·호스트는 실제 값을 그대로 적는 실수를 하지 않는다. 항상 `<사용자>`, `<클러스터>` 같은 자리표시자를 쓴다.
- 스코프 밖(RFC의 Non-scope에 명시된) 작업은 별도 이슈로 분리하고, 현재 작업에 포함하지 않는다.
- npm/yarn 명령을 사용하지 않는다 — 항상 pnpm을 사용한다.

---

## 7. 참고 링크

- 아키텍처 현황: `docs/architecture/ARCHITECTURE.md`
- 진행 중인 ADR 목록: `docs/adr/`
- 이슈 트래커: TODO (GitHub Issues URL)
- 초기 세팅 RFC: `docs/rfcs/2026-09-15-project-initial-setup.md`

---

## 8. 기기 전환 시 — "메모리 저장해줘"

사용자가 여러 기기(예: 집 PC / 회사 PC)를 오가며 작업한다. Claude의 로컬 memory(대화 중 자동으로 쌓이는 개인화 기억)는 **기기 간 동기화되지 않으므로**, 다른 기기로 넘어가기 전에 사용자가 "메모리 저장해줘"라고 말하면 아래를 수행한다.

1. 현재 세션 동안 로컬 memory에 쌓인 내용 중, 이 프로젝트에 계속 적용될 항목(워크플로우 규칙·기술 결정·스코프 변경 등)을 골라낸다.
2. 성격에 맞는 git 추적 파일로 옮겨 적는다: 규칙/가드레일 → 이 파일, 기술 결정 → `docs/adr/`, 제품 스코프 → `docs/prd/`, 구조 변경 → `docs/architecture/ARCHITECTURE.md`.
3. `pnpm exec tsc --noEmit` / `pnpm build`로 확인 후 커밋·푸시한다 (6번 참고).
4. 이제 git 파일에 반영된 로컬 memory 항목은 **삭제**한다 — 같은 내용을 두 곳에 복제해서 남겨두지 않는다(git 파일이 유일한 출처).
