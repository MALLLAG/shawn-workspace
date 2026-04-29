# Agent Packet: `<repo-name>`

> Change id: `<change-id>`
> Repo path: `<path>`
> Branch: `<branch>`
> Visibility: public | private | unknown

## 임무

승인된 계획 중 이 repo에 할당된 범위만 구현한다.

## 작업 경계

- 담당 파일 또는 영역:
- 수정하지 말 것:
- 필요한 upstream ref:
- Downstream dependent:

## Git Preflight

- Current branch:
- Base/target branch:
- Status:
- Existing changes:
- Untracked:
- Preservation plan:

## Boundary

- Repo visibility를 확인하고 그 범위에 맞는 정보만 사용한다.
- Public repo 산출물에는 private 구현 세부사항, 내부 service architecture, private gRPC/API, DB schema, credential 구조를 쓰지 않는다.
- Private repo에서 얻은 정보가 public repo 변경에 필요해 보이면 구현 전에 coordinator에게 보고한다.

## 필수 컨텍스트

- 로컬 `AGENTS.md` 또는 `CLAUDE.md`를 읽는다.
- `../proposal.md`, `../design.md`, `../plan.md`, `../repos.yaml`를 읽는다.
- repo 컨벤션과 기존 테스트를 유지한다.

## Discovery Guardrail

이 repo가 단독 변경으로 충분한지 확인한다. 관련 schema/proto/API/credential/config를 소유하거나 소비하는 upstream/downstream repo가 있으면 coordinator에게 보고한다. 임의로 다른 repo까지 구현하지 않는다.

Upstream repo 변경이 필요하면 지정된 commit hash, branch, local artifact, generated artifact, package version 같은 ref를 사용한다. 필요한 ref가 없으면 coordinator에게 요청한다.

## Plan Mismatch

구현 중 계획이 틀렸음이 드러나면 작업을 멈추고 report에 기록한 뒤 coordinator에게 보고한다. Cross-repo contract, public API shape, credential model, DB schema, required upstream ref를 조용히 바꾸지 않는다.

## 작업

- [ ] <작업>
- [ ] 테스트 추가 또는 수정
- [ ] 검증 실행
- [ ] report 작성

## 검증

- 필수 명령:
- 선택 명령:
- 수동 확인:

## Report 형식

`reports/<repo-name>.md`에 아래 내용을 작성한다.

- 요약
- 변경 파일
- 실행한 테스트와 결과
- 위험 또는 후속 작업
- Public/private boundary 확인 결과
- PR 메모
