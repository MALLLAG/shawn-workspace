# <변경 제목> Tasks

> Change id: `<change-id>`
> 상태: draft | approved | in-progress | completed

## Coordinator

- [ ] proposal, discovery, design, plan 동기화
- [ ] cross-repo 또는 위험도 있는 변경은 design/plan 승인 전 구현 금지
- [ ] Required upstream refs 확인
- [ ] public/private boundary 확인
- [ ] repo report 수집

## Repo별 작업

### `<repo-name>`

- [ ] 로컬 `AGENTS.md` 또는 `CLAUDE.md` 읽기
- [ ] git preflight 확인: 현재 branch, base/target branch, `git status -sb`, 기존 변경, untracked, 보존 전략
- [ ] 계획된 branch 생성 또는 전환
- [ ] `agents/<repo-name>.md` 범위 안에서 구현
- [ ] 테스트 추가 또는 수정
- [ ] 필수 check 실행
- [ ] `reports/<repo-name>.md` 작성

## 검증

- [ ] Repo-local check 완료
- [ ] Cross-repo contract 확인
- [ ] Generated artifact 확인
- [ ] 필요한 경우 user-facing docs 확인

## Plan Changes

- [ ] 구현 중 plan mismatch 발견 시 작업 중단 후 coordinator에게 보고
- [ ] 변경 분류: local / design / scope
- [ ] 필요한 문서 갱신: `tasks.md`, `reports/<repo>.md`, `design.md`, `plan.md`, `repos.yaml`, `agents/<repo>.md`
- [ ] scope change인 경우 사용자 승인 후 재개

## PRs

- [ ] PR 생성 전 remote fetch
- [ ] Repo별 PR 생성 또는 PR 본문 준비
- [ ] PR 본문에 required upstream refs 문서화
