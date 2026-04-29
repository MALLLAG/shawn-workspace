# <변경 제목> 구현 계획

> Change id: `<change-id>`
> 관련 문서: `proposal.md`, `discovery.md`, `design.md`, `repos.yaml`, `tasks.md`
> 상태: draft | approved | in-progress | verified | completed

## 실행 그래프

| 단계 | 필요한 upstream ref | Repos | 병렬 가능 | 상태 |
|------|---------------------|-------|-----------|------|
| 1. <단계> | - | `<repo>` | no | [ ] |
| 2. <단계> | `<repo>@<ref>` | `<repo-a>`, `<repo-b>` | yes | [ ] |

## Repo별 Workstream

### `<repo-name>`

- Path:
- Branch:
- Git preflight:
  - Current branch:
  - Base/target branch:
  - Status:
  - Existing changes:
  - Untracked:
  - Preservation plan:
- Required upstream refs:
  - `<repo>`: `<commit-sha-or-branch-or-local-artifact>` — <reason>
- Agent packet: `agents/<repo-name>.md`
- Report: `reports/<repo-name>.md`
- Local instructions:
- Test commands:
- PR target:

체크리스트:

- [ ] <작업>
- [ ] 테스트 추가 또는 수정
- [ ] 검증 명령 실행
- [ ] report 갱신

## 통합 확인

- [ ] Contract compatibility 확인
- [ ] 필요한 generated code 갱신
- [ ] Public/private boundary 검토
- [ ] Cross-repo upstream ref 문서화

## 구현 중 계획 변경

| 변경 | 분류 | 영향 문서 | 승인 필요 | 상태 |
|------|------|-----------|-----------|------|
| `<change>` | local/design/scope | `tasks.md`, `design.md`, `repos.yaml`, `agents/<repo>.md` | yes/no | pending |

분류 기준:

- local: repo 내부 구현 방식 변경. `tasks.md`와 report만 갱신.
- design: contract, data model, API, generated artifact, test strategy, required upstream ref 변경. design/plan/repos/agent packet 갱신.
- scope: repo 범위, user-facing behavior, compatibility, security, rollout 변경. 사용자 재논의 후 진행.

## 품질 Gate

| Repo | 명령 | 필수 여부 | 결과 |
|------|------|-----------|------|
| `<repo>` | `<command>` | yes | pending |

## PR 계획

| Repo | Branch | PR | Required refs | Notes |
|------|--------|----|---------------|-------|
| `<repo>` | `<branch>` | pending | - | - |

## 완료 기준

- [ ] 모든 필수 작업 완료
- [ ] 필수 테스트 통과 또는 skip 사유 기록
- [ ] report에 변경 파일과 위험 기록
- [ ] PR 생성 또는 PR 본문 준비
- [ ] 지속되어야 하는 spec archive 또는 갱신
