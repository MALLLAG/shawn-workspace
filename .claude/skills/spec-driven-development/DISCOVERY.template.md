# <변경 제목> Discovery

> Change id: `<change-id>`
> 상태: draft | reviewed

## 입력

- 사용자 요청:
- Proposal:
- Workspace manifest:
- 조사한 repo:

## 후보 Repo

| Repo | Path | 공개 범위 | 이유 | 확신도 | 로컬 규칙 확인 |
|------|------|-----------|------|--------|---------------|
| `<repo>` | `<path>` | public/private/unknown | <이유> | low/medium/high | yes/no |

## Git Preflight

읽기 전용 명령으로 확인한 repo 상태를 기록한다. 기존 변경은 사용자 작업일 수 있으므로 되돌리지 않는다.

| Repo | Current branch | Base/target branch | Status | Existing changes | Untracked | 충돌 위험 | 계획 |
|------|----------------|--------------------|--------|------------------|-----------|----------|------|
| `<repo>` | `<branch>` | `<base>` | clean/dirty | `<paths 또는 none>` | `<paths 또는 none>` | low/medium/high | preserve/create-branch/ask |

## 영향 범위 확장

최초 후보 repo에서 멈추지 말고, 변경하려는 capability의 흐름을 따라 확장 탐색한다.

| 경로 | 확인 내용 | 관련 repo | Signal | 결론 |
|------|----------|-----------|--------|------|
| User-facing entrypoint | UI/API/CLI에서 생성·수정·조회되는 지점 | `<repo>` | `<file/search>` | include/exclude/unknown |
| Source of truth | canonical model/schema/proto/OpenAPI/GraphQL 소유 repo | `<repo>` | `<file/search>` | include/exclude/unknown |
| Config/Credential path | 설정값, credential, feature flag 입력·저장·전달 경로 | `<repo>` | `<file/search>` | include/exclude/unknown |
| Runtime execution path | worker, scheduler, batch, workflow, consumer | `<repo>` | `<file/search>` | include/exclude/unknown |
| Read/Observability path | dashboard, admin, log, metric, alert | `<repo>` | `<file/search>` | include/exclude/unknown |
| Generated artifacts | proto/client/schema/codegen 산출물과 소비 repo | `<repo>` | `<file/search>` | include/exclude/unknown |

## Negative Support Signals

검색하거나 코드에서 확인한 증거만 기록한다.

| Signal | Query 또는 Pattern | Repo | Evidence | 결론 |
|--------|--------------------|------|----------|------|
| `unsupported` | `<query>` | `<repo>` | `<path/search result>` | include/exclude/unknown |
| `not implemented` | `<query>` | `<repo>` | `<path/search result>` | include/exclude/unknown |
| `null` | `<query>` | `<repo>` | `<path/search result>` | include/exclude/unknown |
| `TODO` | `<query>` | `<repo>` | `<path/search result>` | include/exclude/unknown |
| `fromErrorNotDefinedAt` | `<query>` | `<repo>` | `<path/search result>` | include/exclude/unknown |
| fallback/default case | `<query>` | `<repo>` | `<path/search result>` | include/exclude/unknown |

## 조사 결과

### `<repo-name>`

- 관련 파일:
- 현재 동작:
- 기존 컨벤션:
- 테스트와 명령:
- Side effect:
- Compatibility risk:
- 권장 ownership:

## Cross-Repo Contract

- APIs:
- Events:
- Schemas:
- Generated code:
- Docs:

## 범위 제안

- 포함:
- 제외:
- 사용자 결정 필요:

## 미해결 질문

- [ ] <질문>
