# Reading Log

읽은 책을 기록하고 관리하는 개인용 독서 기록 앱입니다.

## 기능

- 책 등록/조회/수정/삭제
- 읽기 상태 관리: 읽고 싶어요 / 읽는중 / 완독 / 중단
- 별점, 한줄평, 인상 깊은 문장 기록
- 연간 목표 권수 설정, 월별 독서량 통계

## 기술 스택

- Next.js 16 (App Router, Turbopack)
- React 19, TypeScript
- Tailwind CSS v4
- react-hook-form + zod (폼/API 공용 검증)
- pnpm

데이터는 현재 로컬 JSON 파일(`data/reading-log.json`)에 저장되며, 추후 MongoDB로 교체할 예정입니다. 자세한 내용은 `docs/architecture/ARCHITECTURE.md`와 `docs/rfcs/`를 참고하세요.

## 시작하기

```bash
pnpm install
pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 개발 명령어

```bash
pnpm dev      # 개발 서버 (Turbopack)
pnpm build    # 프로덕션 빌드
pnpm start    # 프로덕션 서버 실행
pnpm lint     # 린트
```

## 프로젝트 문서

이 저장소의 작업 규칙과 문서 구조는 [`CLAUDE.md`](./CLAUDE.md)에 정의되어 있습니다.

```
docs/
├── prd/            # 제품 요구사항
├── architecture/   # 현재 시스템 구조 스냅샷
├── adr/            # 기술 결정 기록
└── rfcs/           # 기능별 구현 계획
```
