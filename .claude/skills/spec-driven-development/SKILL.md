---
name: spec-driven-development
description: .sdd/changes 기반 spec-driven development 워크플로우를 작성하고 실행합니다. 요구사항 명확화, 코드베이스 딥다이브, proposal/design/plan/tasks 작성, repo별 subagent 조율, 승인된 계획 기반 구현, 검증, PR 준비가 필요할 때 사용합니다. multi-repo workspace와 repo workstream 조율을 지원하며 mani 같은 workspace manifest는 선택적으로 사용합니다.
---

# 스펙 주도 개발

변경 요청을 바로 코드로 옮기지 말고, 먼저 검토 가능한 산출물로 정리한 뒤 repo별로 경계가 분명한 작업 단위로 실행한다.

## 원칙

- 설계 전에 발견한다. 범위를 정하기 전에 읽기 전용 코드베이스 조사를 먼저 수행한다.
- 코드 전에 스펙을 쓴다. 구현은 승인된 설계와 계획의 실행으로 취급한다.
- 변경은 작게 유지한다. 각 repo의 기존 컨벤션과 로컬 지침을 따른다.
- 중앙에서 조율한다. coordinator는 cross-repo 범위, contract, 순서, PR 전략을 책임진다.
- cross-repo 의존성은 배포나 병합 순서로 표현하지 않는다. 구현 중 필요한 upstream 변경은 commit hash, branch, local path, generated artifact, package version 등 현재 workspace에서 사용할 수 있는 ref로 고정한다.
- repo 작업을 격리한다. repo agent는 하나의 repo 또는 명확히 제한된 write scope만 맡는다.
- 안전한 작업만 병렬화한다. 탐색은 병렬로 가능하지만, 구현은 contract와 의존성이 명확해진 뒤에만 병렬화한다.
- private 구현 세부사항을 public repo로 유출하지 않는다. public-facing 산출물을 쓰기 전에 workspace 규칙을 확인한다.
- 산출물은 간결하게 유지한다. 대화 로그가 아니라 결정, 위험, 검증 결과를 기록한다.

## 기본 산출물

변경 단위마다 하나의 change folder를 만든다.

```text
.sdd/
  changes/
    <change-id>/
      proposal.md             # 배경, 목표, 범위, 성공 기준
      discovery.md            # 코드베이스 조사와 영향 분석
      design.md               # 기술 접근, contract, tradeoff
      plan.md                 # 의존성 그래프와 실행 계획
      repos.yaml              # repo별 workstream, branch, test, PR
      tasks.md                # 진행 중 동기화하는 체크리스트
      agents/
        <repo>.md             # repo별 agent 작업 지시서
      reports/
        <repo>.md             # repo별 구현 보고서
```

## 워크플로우

1. 요구사항 청취
   - 사용자 목표, 비즈니스 이유, 성공 기준, non-goal, 미확정 사항을 기록한다.
   - `proposal.md`를 생성하거나 갱신한다.
   - 제약으로 주어진 내용이 아니라면 구현 세부사항을 이 단계에서 확정하지 않는다.

2. 코드베이스 탐색
   - 로컬 문맥, manifest, 사용자 입력을 기반으로 후보 repo를 찾는다.
   - 후보 repo마다 로컬 `AGENTS.md` 또는 `CLAUDE.md`를 먼저 읽는다.
   - 후보 repo마다 git preflight를 읽기 전용으로 확인한다: 현재 branch, base/target branch, `git status -sb`, 기존 변경 파일, untracked 파일, 사용자 변경과의 충돌 가능성.
   - 관련 코드, 테스트, schema, API contract, 문서, 최근 패턴을 확인한다.
   - 최초 후보 repo에서 발견한 model/schema/credential/API 이름으로 workspace-wide search를 수행하고, caller/callee 방향으로 최소 한 단계씩 확장 탐색한다.
   - capability 흐름을 확인한다: user-facing entrypoint, source of truth, config/credential path, runtime execution path, read/observability path, generated artifact 소비 repo.
   - `unsupported`, `not implemented`, `null`, `TODO`, `fromErrorNotDefinedAt`, fallback/default case 같은 negative support signal을 검색하고 증거를 남긴다.
   - 탐색은 읽기 전용으로 유지한다. 결과는 `discovery.md`에 기록한다.

3. 범위와 방향성 논의
   - 탐색 결과를 impact matrix로 정리한다: repo, 공개 범위, 이유, 필요한 변경, 위험, 테스트.
   - side effect, compatibility, rollout, 대안을 사용자와 논의한다.
   - 변경 방향이 중요하거나 cross-repo라면 구현 계획으로 넘어가기 전에 명시적 승인을 받는다.

4. 스펙과 설계
   - 요구사항, contract, data/API/event 변경, compatibility, rollout, test strategy를 `design.md`에 쓴다.
   - living spec을 쓰는 프로젝트라면 `specs/` 아래에 간결한 spec delta를 추가한다.
   - 미해결 질문은 명확히 표시한다. 가정을 숨기지 않는다.

5. 계획
   - `plan.md`, `repos.yaml`, `tasks.md`, `agents/<repo>.md`를 작성한다.
   - repo별 git preflight 결과와 branch 전환 또는 기존 변경 보존 전략을 기록한다.
   - 의존성을 단순 목록이 아니라 그래프로 모델링한다.
   - contract 또는 interface repo를 downstream 구현 repo보다 먼저 두되, downstream 작업은 필요한 upstream ref가 준비되면 진행할 수 있게 계획한다.
   - `depends_on`은 구현, 빌드, 검증에 필요한 upstream ref로만 기록하고 배포 또는 병합 순서를 표현하지 않는다.
   - 병렬 실행 가능한 repo workstream과 순차 실행해야 하는 workstream을 구분한다.
   - cross-repo 또는 위험도가 있는 변경은 design/plan 승인 전 구현하지 않는다.

6. 구현
   - plan과 repo agent packet을 따른다.
   - 쓰기 작업은 할당된 repo 또는 file scope 안에서만 수행한다.
   - 진행하면서 `tasks.md`와 `reports/<repo>.md`를 갱신한다.
   - 탐색 중 plan이 틀렸음이 드러나면 멈추고 spec/plan을 먼저 갱신한다.
   - 구현 중 승인된 설계와 다른 사실이 발견되면 코드를 계속 밀어붙이지 않는다. 변경 크기에 따라 tasks/report만 갱신할지, design/plan/repos/agent packet을 갱신할지, 사용자와 scope를 재논의할지 결정한다.

7. 검증
   - repo-local test, linter, generated-code check, cross-repo contract check를 실행한다.
   - 정확한 명령과 결과를 report 또는 plan에 기록한다.
   - public repo를 건드리기 전에 public/private boundary 위험을 검토한다.

8. PR
   - remote state를 fetch하고 테스트 결과를 기록한 뒤 repo별 PR을 만든다.
   - 모든 PR에 공통 change id를 연결한다.
   - 필요한 upstream ref, 관련 PR, 검증 결과, spec 링크를 포함한다.

9. 보관
   - 완료 후 지속되어야 하는 요구사항은 living spec에 반영한다.
   - change folder를 archive하거나 최종 PR 링크와 함께 completed로 표시한다.

## 구현 중 계획 변경

승인된 설계나 계획이 구현 중 틀렸음이 드러나면 먼저 변경을 문서화한다.

- Local adjustment: repo 내부 구현 방식만 바뀐다. `tasks.md`와 `reports/<repo>.md`를 갱신하고 계속 진행한다.
- Design adjustment: contract, data model, API, generated artifact, test strategy, required upstream ref가 바뀐다. `design.md`, `plan.md`, `repos.yaml`, 관련 `agents/<repo>.md`를 갱신한 뒤 진행한다.
- Scope change: repo 범위, user-facing behavior, compatibility, security, rollout이 바뀐다. 사용자와 재논의하고 승인 후 계획을 갱신한다.

Repo agent는 cross-repo contract, public API shape, credential model, DB schema, required upstream ref를 임의로 바꾸지 않는다. mismatch를 발견하면 coordinator에게 보고한다.

## 선택적 Workspace Manifest

특정 workspace tool에 의존하지 않는다. manifest가 있으면 repo discovery와 안전한 bulk operation에만 사용한다.

- `mani.yaml`: repo와 tag를 찾을 때 `mani list projects`를 사용한다.
- `mani sync --projects <name>`: 필요한 target repo가 없을 때 clone한다.
- `mani exec --parallel <cmd>`: 선택된 repo들에 같은 안전한 명령을 실행해야 할 때만 사용한다.

설계 판단, repo-specific test, PR 본문 작성에 `mani`를 억지로 사용하지 않는다.

## 템플릿

산출물을 만들 때 아래 템플릿을 사용한다.

- `PROPOSAL.template.md`
- `DISCOVERY.template.md`
- `DESIGN.template.md`
- `PLAN.template.md`
- `TASKS.template.md`
- `REPOS.template.yaml`
- `AGENT-PACKET.template.md`
- `REPO-REPORT.template.md`
