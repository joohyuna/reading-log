# ADR-0001: 기존 MongoDB Atlas 클러스터 공유, DB는 앱별 분리

- **날짜**: 2026-09-29
- **관련 RFC**: [2026-09-29-mongodb-migration](../rfcs/2026-09-29-mongodb-migration.md)

## Status
Accepted

## Context
- reading-log는 MVP 단계에서 로컬 JSON 파일(`data/reading-log.json`)에 데이터를 저장한다. 그래서 기기 간 동기화가 안 되고, 배포 환경에서도 쓸 수 없다.
- 사용자의 다른 프로젝트인 todo와 mini-schedule은 이미 **하나의 MongoDB Atlas 클러스터를 공유**하고 있다. 각자 DB 이름만 다르게 쓴다 (mini-schedule은 `mini-diary`).
- 추후 mini-schedule과 연동할 계획이 있지만, 연동 방식(계정 공유, 데이터 연계 등)은 아직 정하지 않았다.
- MVP RFC에서 MongoDB 전환을 전제로 데이터 계층(`lib/data/*`)을 분리해 두었다.

## Decision
1. 저장소로 MongoDB Atlas를 사용한다.
2. 새 클러스터를 만들지 않고, **todo·mini-schedule과 같은 기존 클러스터를 재사용**한다. DB 이름은 `reading-log`로 분리한다.
3. DB 사용자와 네트워크 접근 설정은 기존 프로젝트와 같은 방식을 따른다. 필요하면 나중에 앱별 사용자로 분리한다.
4. 이번에는 reading-log 전환만 진행하고, mini-schedule 연동은 **별도 RFC**에서 결정한다.

## Consequences
- **장점**
  - 새 인프라를 만들 필요가 없다. 연결 문자열의 DB 이름만 바꾸면 바로 쓸 수 있다.
  - 연동할 대상 DB(`mini-diary`)와 같은 클러스터에 있어서, 연동할 때 인프라를 옮길 필요가 없다.
  - DB가 분리되어 있어서 앱별 데이터를 독립적으로 관리하고 백업·삭제할 수 있다.
- **단점 / 비용**
  - 오프라인에서는 개발할 수 없고, 기기마다 Atlas IP 허용 목록을 관리해야 한다.
  - Free 티어의 용량과 연결 수 제한을 세 앱이 나눠 쓴다.
  - DB 사용자를 공유하면, 한 앱의 자격증명이 유출될 때 다른 앱 DB까지 노출된다. 배포하거나 사용자가 늘어나는 시점에는 앱별 사용자로 분리하는 것을 다시 검토한다.
  - 연결 문자열의 DB 이름을 잘못 적으면 다른 앱 DB에 쓰게 되므로, 설정할 때 주의가 필요하다.
