# CLAUDE.md

이 파일은 이 워크스페이스에서 AI 에이전트가 작업할 때 가장 먼저 확인해야 하는 루트 가이드입니다.

`README.md`는 사람을 위한 개요 문서이고, `mani.yaml`은 저장소 구성의 단일 source of truth입니다.
이 문서는 에이전트가 여러 독립 저장소를 안전하게 다루기 위한 작업 규칙만 담습니다.

## 프로젝트 개요

Shawn Workspace는 예시 마이크로서비스 시스템을 구성하는 여러 독립 Git 저장소를 한 곳에서 관리하는 루트 워크스페이스입니다.

서브모듈을 사용하지 않습니다. 각 하위 프로젝트는 자기 자신의 `.git`을 가진 독립 저장소입니다.

## 저장소 구성

| 저장소 | 경로 | 설명 |
|--------|------|------|
| `web-app` | `frontend/web-app` | 사용자 화면을 제공하는 웹 애플리케이션 |
| `user-service` | `backend/user-service` | 사용자 정보를 관리하는 서비스 |
| `catalog-service` | `backend/catalog-service` | 상품 정보를 관리하는 서비스 |
| `order-service` | `backend/order-service` | 주문을 처리하는 서비스 |

저장소의 실제 URL, 태그, 경로는 항상 [`mani.yaml`](./mani.yaml)을 기준으로 확인합니다.

## 에이전트 작업 규칙

1. 루트에서 바로 빌드/테스트하지 말고, 작업 대상 하위 저장소로 `cd`한 뒤 명령을 실행합니다.
2. 하위 저장소에 `CLAUDE.md` 또는 `AGENTS.md`가 있으면 그 문서를 루트 문서보다 우선합니다.
3. 하위 저장소 간 변경을 섞지 않습니다. 프론트엔드, 사용자 서비스, 상품 서비스, 주문 서비스 변경은 각각의 repo 경계를 지킵니다.
4. 원격 브랜치, PR, push, rebase 등 remote와 관련된 작업 전에는 해당 저장소에서 `git fetch origin`을 먼저 실행합니다.
5. 여러 저장소를 조회하거나 명령을 반복 실행할 때는 `mani`를 우선 사용합니다.
6. 기존 파일의 스타일과 빌드 도구를 따릅니다. 새 도구를 추가하기 전에 현재 repo의 구성을 먼저 확인합니다.
7. 사용자가 명시하지 않은 루트 repo 변경과 하위 repo 변경을 한 커밋에 섞지 않습니다.

## 저장소 관리

워크스페이스의 저장소 목록은 `mani.yaml`이 기준입니다.

```bash
mani check                           # mani 설정 검증
mani sync --parallel                 # 모든 저장소 클론
mani sync --projects <name>          # 단일 저장소 클론
mani list projects                   # 저장소 목록 보기
mani list projects --tags <tag>      # 태그로 필터
mani exec --all --parallel git status
mani exec --tags backend --parallel git status
```

특정 repo의 경로가 헷갈리면 먼저 `mani list projects`로 확인합니다.

## 공통 명령

### Frontend

대상: `frontend/web-app`

```bash
npm install
npm run dev
npm run build
```

### Backend

대상: `backend/user-service`, `backend/catalog-service`, `backend/order-service`

```bash
gradle run
gradle test
gradle build
```

Gradle wrapper가 추가된 repo에서는 `gradle` 대신 `./gradlew`를 사용합니다.

## 서비스 포트

| 서비스 | 기본 포트 | 주요 엔드포인트 |
|--------|-----------|-----------------|
| `web-app` | `5173` | 개발 서버 |
| `user-service` | `8081` | `GET /health`, `GET /users` |
| `catalog-service` | `8082` | `GET /health`, `GET /products` |
| `order-service` | `8083` | `GET /health`, `GET /orders` |

## 개발 가이드

### Frontend

- React와 TypeScript 기준으로 작성합니다.
- 컴포넌트는 작게 유지하고, 화면에 필요한 데이터와 표시 로직을 분리합니다.
- 스타일은 기존 CSS 구조를 먼저 따릅니다.
- 빌드 확인은 `npm run build`로 합니다.

### Backend

- Kotlin/Ktor 기준으로 작성합니다.
- 라우팅, 요청/응답 모델, 저장소 역할을 명확히 나눕니다.
- 샘플 데이터는 실제 개인정보처럼 보이지 않는 예시 값만 사용합니다.
- 테스트는 Ktor test host와 Kotlin test를 사용합니다.
- 빌드 확인은 `gradle test` 또는 `gradle build`로 합니다.

## API 원칙

- 외부로 드러나는 응답은 JSON을 기본으로 합니다.
- 오류 응답은 호출자가 이해할 수 있는 짧은 메시지를 제공합니다.
- 서비스 간 직접 호출을 추가할 때는 먼저 README와 이 문서에 필요한 운영 정보를 갱신합니다.

## 변경 검증 체크리스트

작업이 끝나면 변경 범위에 맞게 아래를 확인합니다.

- `mani check`
- `mani list projects`
- 프론트엔드 변경: `npm run build`
- 백엔드 변경: `gradle test`
- Git 상태 확인: `git status --short`

## Git 작업

하위 저장소는 각각 독립적으로 커밋합니다.

```bash
cd frontend/web-app
git status --short
git add .
git commit -m "..."
git push
```

루트 워크스페이스의 문서나 `mani.yaml` 변경은 루트 repo에서 별도로 커밋합니다.

## 새 저장소 추가

1. `mani.yaml`의 `projects` 섹션에 `path`, `url`, `desc`, `tags`를 추가합니다.
2. `mani check`로 설정을 검증합니다.
3. `mani sync --projects <name>`로 클론합니다.
4. README와 이 문서의 저장소 표, 태그, 명령 예시가 바뀌어야 하는지 확인합니다.

## 문서 작성 원칙

- 루트 문서는 워크스페이스 전체 규칙만 다룹니다.
- 특정 구현 세부사항은 해당 하위 저장소의 문서에 둡니다.
- 문서에 민감정보나 실제 운영 정보를 넣지 않습니다.
