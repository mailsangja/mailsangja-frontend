# 메일상자 프론트엔드

메일상자는 AI 기반 다중 계정 인박스 관리 자동화 서비스입니다.

## 프로젝트 개요

현대 사용자는 업무용, 학교용, 개인용, 프로젝트용 등 다양한 목적의 이메일 계정을 동시에 사용합니다. 계정이 분산될수록 여러 메일 계정을 관리하기 위한 부담이 커지고, 중요한 메일을 늦게 확인하거나 놓치는 문제가 발생합니다.

메일상자는 이러한 비효율을 해결하기 위해 기획된 서비스입니다. 여러 메일 벤더 계정을 하나의 통합 인박스로 연결하고, AI를 활용해 메일 확인, 분류, 작성 과정의 부담을 줄이는 것을 목표로 합니다.

메일상자는 단순히 여러 메일을 한곳에 모아 보여주는 서비스가 아니라, 사용자의 메일 관리와 커뮤니케이션 과정 전반을 보조하는 AI 에이전트형 도구를 지향합니다. 이를 통해 사용자 편의성, 업무 생산성, 커뮤니케이션 정확성을 함께 향상시키는 것을 목표로 합니다.

## 목표

- 여러 이메일 계정을 하나의 인박스에서 통합 조회
- 메일 수신, 읽음 처리, 삭제, 스레드 조회 등 메일 흐름 관리
- 계정 선택 기반 메일 작성 및 발송
- AI 기반 메일 요약, 우선순위 강조, 자동 분류 및 라벨 추천
- AI 기반 제목/본문 초안 생성, 답장 방향 추천, 발송 전 점검 지원

## 주요 기능

### 1. 통합 인박스

- Gmail 계정 연동 및 복수 메일 계정 관리
- 받은편지함, 보낸편지함, 별표, 휴지통 기반 메일함 탐색
- 계정, 라벨, 라벨 그룹, 읽음 상태, 검색어 기반 메일 필터링
- 스레드 단위 메일 조회, 읽음/안 읽음 처리, 별표 처리
- 휴지통 이동, 메시지/스레드 복구, 첨부파일 다운로드
- Firebase Cloud Messaging 기반 웹 푸시 알림

### 2. 메일 작성 및 발송

- 발신 계정 선택 후 메일 작성 및 발송
- 첨부파일, 인라인 이미지, CC, BCC 지원
- 주소록 기반 자동완성
- 기존 스레드 맥락을 반영한 답장 작성
- 관련 메일 검색 패널과 참조 스레드 패널 제공

### 3. AI 메일 보조

- 장문 메일 3줄 요약
- 중요 메일 우선 표시
- 자동 라벨 및 규칙 추천
- 사용자 정의 라벨/규칙 수정 지원
- 답장 초안 추천 및 선택 지원
- AI 사용량 조회

### 4. AI 작성 보조

- 메일 목적, 제목, 수신자, 답장 맥락 기반 초안 생성
- 대화 맥락 기반 답장 방향 추천
- 발송 전 오탈자, 첨부 누락, 어조/문맥 점검

### 5. 사용자 설정과 결제

- 기본 발신 계정 설정
- 메일 계정 별칭, 아이콘, 색상, 활성 상태 관리
- 라벨 색상, 알림 정책, 자동 분류 규칙, 라벨 그룹 관리
- 테마, 언어, 인박스 표시 방식, 첨부파일 표시 방식 설정
- PortOne 기반 유료 플랜 결제 및 업그레이드 흐름

## 기술 스택

- `React 19`
- `TypeScript`
- `Vite`
- `TanStack Start`
- `TanStack Router`
- `TanStack React Query`
- `Tailwind CSS v4`
- `shadcn/ui`
- `Base UI`
- `Paraglide JS` / `inlang`
- `Firebase Cloud Messaging`
- `vite-plugin-pwa` / `Workbox`
- `PortOne SDK`
- `Amplitude` / `Google Analytics`
- `React Email Editor`
- `Tiptap`
- `Fetch API`

## 아키텍처

- `TanStack Start`의 SPA 모드를 사용합니다.
- 랜딩 페이지, 약관 페이지 등 정적 페이지는 정적 프리렌더링 대상으로 관리합니다.
- 서버 상태는 TanStack React Query의 query/mutation 계층으로 분리합니다.
- 라우팅은 파일 기반 TanStack Router 구조를 사용합니다.
- 다국어 메시지는 paraglide 기반 i18n을 사용합니다.
- PWA는 커스텀 서비스 워커를 빌드하며, Workbox precache와 FCM 백그라운드 알림을 함께 처리합니다.
- 메일 작성기는 React Email Editor와 Tiptap 기반 에디터를 사용합니다.

## CI/CD 및 배포 파이프라인

GitHub Actions 워크플로우는 `.github/workflows/deploy-pages.yml`에서 관리합니다.

- `main` 브랜치로 push되거나 `main` 대상 pull request가 생성되면 빌드 검증을 실행합니다.
- `workflow_dispatch`를 통해 수동 실행할 수 있습니다.
- 빌드 작업은 Node.js 24에서 실행되며, `npm run build`로 타입 검사와 프로덕션 빌드를 함께 수행합니다.
- 빌드 시 필요한 환경변수 값은 GitHub Actions repository variables에서 주입합니다.
- pull request에서는 빌드와 Pages artifact 생성까지만 수행하고, 실제 배포는 건너뜁니다.
- `main` push 또는 수동 실행에서는 `dist/client`를 GitHub Pages artifact로 업로드한 뒤 GitHub Pages 환경에 배포합니다.

배포 산출물은 `dist/client`이며, `public/CNAME`을 통해 커스텀 도메인 `mail.ajou.app`을 사용합니다. SPA fallback은 빌드 과정에서 생성되는 `404.html`이 담당합니다.

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

기본적으로 Vite 개발 서버가 실행되며, 로컬 주소는 실행 로그에서 확인할 수 있습니다.

### 3. 주요 스크립트

```bash
npm run dev        # 개발 서버 실행
npm run build      # 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기
npm run lint       # ESLint 실행
npm run format     # Prettier 포맷팅
npm run typecheck  # 타입 검사
```

## 디렉터리 구조

```text
mailsangja-frontend/
├── .env.example      # 로컬 환경변수 템플릿
├── .github/          # GitHub 협업 관련 템플릿 및 GitHub Actions CI/CD 워크플로우
├── components.json   # shadcn/ui 설정
├── docs/             # API, 푸시 알림 등 개발 참고 문서
├── messages/         # inlang 원본 다국어 메시지
├── project.inlang/   # inlang 프로젝트 설정
├── public/           # 정적 에셋, PWA 아이콘, CNAME, robots.txt
└── src/
    ├── api/            # 백엔드 API 호출 함수
    ├── components/     # 화면/도메인/UI 컴포넌트
    ├── hooks/          # 클라이언트 상태와 UI 보조 훅
    ├── lib/            # 공통 유틸리티, API 클라이언트, PWA/FCM/분석 연동
    ├── mutations/      # React Query mutation 훅
    ├── paraglide/      # Paraglide 생성 산출물
    ├── queries/        # React Query query 훅
    ├── routes/         # TanStack Router 파일 기반 라우트
    ├── service-worker/ # 서비스 워커 보조 모듈
    ├── types/          # 도메인 타입 정의
    └── sw.ts           # PWA/FCM 커스텀 서비스 워커
```
