# ADR-0002: DB 접근에 Prisma 사용 (mini-schedule과 통일)

- **날짜**: 2026-09-29
- **관련 RFC**: [2026-09-29-mongodb-migration](../rfcs/2026-09-29-mongodb-migration.md)

## Status
Accepted

## Context
- MongoDB 접근 방식으로 두 가지를 검토했다: (A) 공식 `mongodb` Node.js 드라이버, (B) Prisma ORM.
- 같은 클러스터를 쓰는 mini-schedule은 이미 Prisma 6.19.3을 쓰고 있다. 구성은 `prisma/schema.prisma`, `globalThis` 싱글톤, `prisma db push`, `postinstall: prisma generate`다.
- 향후 mini-schedule과 연동할 계획이 있다 (예: `User` 모델 공유).
- 이 프로젝트에는 zod 스키마(`schemas/`)를 폼·API 입력 검증의 단일 소스로 쓴다는 규칙이 있다 (CLAUDE.md 5번).

## Decision
Prisma를 사용하고, 버전과 구성은 mini-schedule과 맞춘다.
- DB 문서의 모양은 `schema.prisma`가, 폼·API 입력 검증은 계속 zod가 담당한다.
- 데이터 계층(`lib/data/*`)이 Prisma 결과를 기존 zod 기반 타입(`Book`, `ReadingGoal`)으로 변환해서 반환한다.

## Consequences
- **장점**
  - 두 프로젝트의 DB 코드 패턴(싱글톤, 스키마 반영 방식, 빌드 스크립트)이 같아서 오가며 작업하기 쉽다.
  - 연동할 때 모델 정의나 클라이언트 사용법을 공유하기 쉽다.
  - 쿼리 결과에 타입이 자동으로 붙는다.
- **단점 / 비용**
  - 모델을 `schema.prisma`와 zod 양쪽에 정의해야 한다. 필드를 바꿀 때 두 곳을 함께 고쳐야 한다.
  - Prisma는 빈 선택 필드를 `null`로 돌려주므로, `undefined`를 기대하는 기존 타입에 맞추는 변환 코드가 필요하다.
  - `prisma generate` 단계와 엔진 바이너리가 추가된다 (pnpm `allowBuilds` 설정이 필요하다).
