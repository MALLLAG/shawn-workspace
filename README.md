# Shawn Workspace

AI 에이전트가 예시 마이크로서비스 시스템의 전체 맥락을 파악하며 작업할 수 있도록 frontend와 backend 저장소를 한 곳에서 관리하는 루트 워크스페이스입니다.

서브모듈을 쓰지 않고 [mani CLI](https://manicli.com/)로 여러 독립 git repo를 워크스페이스 루트에서 일괄 관리합니다.
저장소 구성, 위치, 태그는 [`mani.yaml`](./mani.yaml)이 단일 source of truth입니다.

## 사전 준비

```sh
brew install alajmo/mani/mani
# 또는
curl -sfL https://raw.githubusercontent.com/alajmo/mani/main/install.sh | sh
```

프론트엔드 실행에는 Node.js/npm이 필요합니다.
Kotlin/Ktor 서비스 실행에는 JDK 21과 Gradle 또는 각 서비스의 Gradle wrapper가 필요합니다.

## 저장소 구성

| 저장소 | 경로 | 원격 저장소 | 설명 |
|--------|------|-------------|------|
| `web-app` | `frontend/web-app` | `MALLLAG/web-app` | 사용자 화면을 제공하는 웹 애플리케이션 |
| `user-service` | `backend/user-service` | `MALLLAG/user-service` | 사용자 정보를 관리하는 서비스 |
| `catalog-service` | `backend/catalog-service` | `MALLLAG/catalog-service` | 상품 정보를 관리하는 서비스 |
| `order-service` | `backend/order-service` | `MALLLAG/order-service` | 주문을 처리하는 서비스 |

## 사용법

```sh
# 저장소 목록·태그 보기
mani list projects
mani list tags

# 태그로 필터
mani list projects --tags frontend
mani list projects --tags backend
mani list projects --tags service
mani list projects --tags-expr 'backend && ktor'

# 모든 저장소에서 명령 실행
mani exec --all --parallel git status
mani exec --tags backend --parallel git status

# 프로젝트별 개발 명령 실행
mani exec --projects web-app npm install
mani exec --projects web-app 'npm run dev -- --host 0.0.0.0'
mani exec --tags backend 'gradle run'
```

각 프로젝트의 GitHub URL은 `mani.yaml`의 `url` 필드에 정의되어 있습니다.
새 환경에서는 `mani sync --parallel`로 4개 저장소를 한 번에 클론할 수 있습니다.

## 태그 체계

| 태그 | 의미 |
|------|------|
| `frontend` | 사용자 화면이나 브라우저에서 실행되는 프로젝트 |
| `backend` | 서버 측 프로젝트 |
| `service` | 독립 실행 가능한 마이크로서비스 |
| `react` | React 기반 프론트엔드 |
| `kotlin` | Kotlin 기반 프로젝트 |
| `ktor` | Ktor 기반 HTTP 서비스 |
| `example` | 워크스페이스 구조를 설명하기 위한 샘플 저장소 |

전체 태그 확인: `mani list tags`.

## 새 저장소 추가

1. `mani.yaml`의 `projects` 섹션에 항목 추가 (`path`, `url`, `desc`, `tags`)
2. `mani sync --projects <name>`로 클론
3. 필요 시 이 README의 저장소 구성과 태그 설명 갱신
