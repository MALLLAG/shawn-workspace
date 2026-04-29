# SDD Constitution

- 하나의 작업에는 하나의 change id를 사용한다.
- 설계 전에 코드와 repo 규칙을 먼저 탐색한다.
- 중요한 scope와 contract 결정은 구현 전에 논의한다.
- 구현 전에 `.sdd/tools/validate-change.ts <change-id> --stage=plan`을 통과한다.
- 구현 작업은 승인된 repo와 파일 범위 안으로 제한한다.
- 로컬 컨벤션, 테스트, 빌드 도구를 유지한다.
- Workspace manifest는 discovery와 안전한 bulk operation에만 사용한다.
- Public/private boundary는 release risk로 취급하고 명시적으로 검토한다.
- Spec은 사람이 리뷰할 수 있을 만큼 간결하게 유지한다.
