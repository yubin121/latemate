# AGENTS.md — LateMate

이 파일은 이 저장소에서 작업하는 Codex(Codex.ai/code)에게 지침을 제공합니다.

---

## AGENTS.md 계층 구조 원칙

이 파일은 **이 프로젝트에 특화된 내용만** 기술한다.
범용 원칙(기획→승인→구현 워크플로우, 네이밍, 컴포넌트 원칙, 브랜치 전략 등)은
`~/.Codex/AGENTS.md`(전역)에 작성되어 있으며, 이 파일에는 중복 기술하지 않는다.

```
~/.Codex/AGENTS.md        ← 전역: 워크플로우, 코드 스타일, 브랜치 전략 등 공통
└── latemate/AGENTS.md     ← 프로젝트 특화: 기술 스택, 폴더 구조, 명령어, 개발 제약
```

---

## 프로젝트 개요

**LateMate** — 실시간 위치 공유 기반 지각 방지 웹 서비스.

약속을 생성하고 링크를 공유하면, 참여자들이 실시간 위치를 공유하고
시스템이 자동으로 ETA를 계산해 지각 여부를 판단한다.

상세 내용은 [`docs/PRD.md`](./docs/PRD.md) 참조.

## Out of Scope

MVP에서 **절대 구현하지 않는** 기능 목록:

- 채팅 기능
- 소셜 피드, 친구 시스템
- 복잡한 인증 (OAuth, 소셜 로그인)
- WebSocket (polling 방식만 사용)
- 푸시 알림
- 백그라운드 위치 추적
- 약속 수정/삭제
- 약속 히스토리 조회

→ 전체 목록: [`docs/PRD.md` — Section 3. Non-Goals](./docs/PRD.md)

---

## Commands

```bash
# 의존성 설치 (클론 후 1회)
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 타입 검사
npm run typecheck

# 테스트 실행 (Vitest, 1회)
npm test

# 테스트 watch 모드 (개발 중)
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage

# 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 린트
npm run lint
```

---

## Tech Stack

| 역할            | 기술                                            |
| --------------- | ----------------------------------------------- |
| 빌드            | Vite                                            |
| UI              | React 19 + TypeScript                           |
| 스타일링        | TailwindCSS v4 (`@tailwindcss/vite` + `@theme`) |
| 라우팅          | React Router DOM v7 (`createBrowserRouter`)     |
| 서버 상태       | TanStack Query v5                               |
| 클라이언트 상태 | Zustand v5 (persist 미들웨어 포함)              |
| 백엔드/DB       | Supabase (PostgreSQL + RLS)                     |
| 지도            | Kakao Maps JavaScript SDK v3                    |
| ETA 계산        | Kakao Mobility Directions API (REST)            |
| 장소 검색       | Kakao Local Search API (REST)                   |
| 아이콘          | Lucide React (`strokeWidth={1.5}` 통일)         |
| 클래스 유틸     | clsx + tailwind-merge (`cn()` 래퍼)             |
| 테스트          | Vitest + React Testing Library + jsdom (`TZ=Asia/Seoul`) |

### 폴더 구조

```
src/
├── pages/                  # 라우팅 진입점 (thin layer, 데이터 페칭 훅 호출만)
│   ├── LandingPage.tsx
│   ├── CreatePage.tsx
│   ├── JoinPage.tsx
│   └── AppointmentPage.tsx
│
├── features/               # 도메인별 기능 컴포넌트 (비즈니스 로직 포함)
│   ├── appointment/        # AppointmentHeader, CreateForm, InviteShare, ParticipantList
│   ├── map/                # AppointmentMap, ParticipantMarker, DestinationMarker
│   ├── location/           # LocationControl, LocationPermission
│   └── timeline/           # Timeline, TimelineEvent
│
├── components/             # 순수 UI 컴포넌트 (외부 상태 의존 없음)
│   ├── ui/                 # Button, Input, Badge, Avatar, BottomSheet, Spinner, Toast, Skeleton
│   └── layout/             # MobileLayout, SplitLayout, ErrorBoundary
│
├── hooks/                  # 재사용 로직
│   ├── useGeolocation.ts   # GPS watchPosition 래퍼
│   ├── useEta.ts           # ETA 계산 + 지각 판단 (30초 interval)
│   ├── useAppointment.ts   # 약속 데이터 쿼리
│   ├── useParticipants.ts  # 참여자+위치 polling (7초)
│   └── useTimeline.ts      # 타임라인 이벤트 polling (10초)
│
├── stores/                 # Zustand 스토어
│   ├── sessionStore.ts     # 현재 사용자 세션 (localStorage persist)
│   └── locationStore.ts    # 위치 공유 UI 상태 (isSharing만 persist)
│
├── lib/
│   ├── supabase.ts         # Supabase 클라이언트 싱글톤
│   ├── kakao.ts            # Kakao SDK 타입 선언
│   └── api/                # Supabase 쿼리 순수 함수 (훅에서 직접 Supabase 호출 금지)
│       ├── appointments.ts
│       ├── participants.ts
│       ├── locations.ts
│       ├── timeline.ts
│       ├── kakaoDirections.ts
│       └── kakaoLocal.ts
│
├── types/
│   └── index.ts            # 전체 공유 타입 (Appointment, Participant, ParticipantStatus 등)
│
├── constants/
│   └── index.ts            # ARRIVAL_RADIUS_M=100, POLLING_INTERVAL=7000, ETA_INTERVAL=30000
│
└── utils/
    ├── cn.ts               # clsx + tailwind-merge
    ├── formatTime.ts       # HH:MM 포맷, 상대 시각
    ├── distance.ts         # Haversine 거리 계산 (미터 단위)
    └── korean.ts           # 한국어 조사 유틸 (subjectParticle: 이/가)
```

---

## 이 프로젝트 특화 코드 규칙

> 네이밍, 컴포넌트 원칙, props 구조 분해 등 범용 규칙은 `~/.Codex/AGENTS.md` 참조.

### API 레이어 규칙

- 훅(`hooks/`)과 컴포넌트에서 **Supabase를 직접 import하지 않는다.**
- 모든 Supabase 쿼리는 `lib/api/*.ts`의 순수 함수를 통해서만 호출한다.
- Kakao REST API 호출도 `lib/api/kakao*.ts`에서만 수행한다.

### 상태 분류 규칙

| 상태 종류            | 저장 위치                                  |
| -------------------- | ------------------------------------------ |
| 서버 원격 상태       | TanStack Query (`useQuery`, `useMutation`) |
| 전역 클라이언트 상태 | Zustand (`sessionStore`, `locationStore`)  |
| 로컬 UI 상태         | `useState` (모달, 폼 입력값 등)            |

### Polling 규칙

- 참여자 위치: `refetchInterval: 7000` (7초)
- 타임라인 이벤트: `refetchInterval: 10000` (10초)
- ETA 계산: `setInterval` 30초 (Kakao API 호출 비용 절감)
- `refetchIntervalInBackground: false` — 탭 비활성 시 polling 중단

### 지도 마커 규칙

- Kakao 기본 마커 사용 금지. 반드시 `CustomOverlay`로 HTML 마커 구현.
- 마커 인스턴스는 `Map<participantId, CustomOverlay>`로 캐싱.
- 위치 갱신 시 기존 마커를 `setPosition()`으로 이동 (제거 후 재생성 금지).

### 위치 업로드 최적화

- GPS 좌표 변화량 < 10m 이고 마지막 업로드 후 10초 미경과 → Supabase 업로드 생략.
- ETA 계산은 30초마다 1회만 호출 (Kakao Directions API 호출 최소화).

---

## 환경 변수

```env
# .env.local (gitignore 처리됨)
VITE_SUPABASE_URL=          # Supabase 프로젝트 URL
VITE_SUPABASE_ANON_KEY=     # Supabase anon public key
VITE_KAKAO_MAP_KEY=         # Kakao Maps JS SDK 앱 키
VITE_KAKAO_REST_API_KEY=    # Kakao REST API 키 (Directions, Local Search)
```

참고 파일: `.env.example` (키 목록만, 값 없음)

---

## 문서 파일 역할

| 파일             | 역할                                                                               |
| ---------------- | ---------------------------------------------------------------------------------- |
| `docs/PRD.md`    | 제품 요구사항 — 목표, 기능 명세, Out of Scope, 데이터 흐름                         |
| `docs/DESIGN.md` | 프론트엔드 아키텍처 + 비주얼 디자인 시스템 (컬러, 타이포, 애니메이션, 페이지별 UI) |
| `docs/TASK.md`   | 개발 작업 목록 — Phase별 작업, 난이도, 선행 작업, 진행 상태                        |

---

## TASK.md 관리 규칙

`docs/TASK.md`는 개발 작업의 **유일한 진행 현황 추적 파일**이다.

### Codex가 반드시 해야 하는 행동

1. **작업 시작 전**: 해당 Task의 상태를 `[ ]` → `[~]` (진행 중)으로 변경한다.
2. **작업 완료 후**: 해당 Task의 상태를 `[~]` → `[x]` (완료)로 변경한다.
3. **기술적 결정이 생겼을 때**: 해당 Task 하단에 결정 내용과 이유를 한 줄로 기록한다.

### 작업 조회 규칙

- **"다음 작업은?"** → `docs/TASK.md`를 읽고 `[ ]` 상태 중 선행 작업이 완료된 첫 번째 항목을 답한다.
- **"지금 어디까지 했어?"** → `docs/TASK.md`에서 `[x]` 완료 항목과 `[~]` 진행 중 항목을 요약한다.

---

## 개발 제약 사항

### Kakao Maps SDK

- `index.html`에 `<script>` 태그로 로드 (번들에 포함하지 않음).
- `kakao.maps.load(callback)` 콜백 내에서만 SDK를 사용할 수 있다.
- `window.kakao` 타입은 `lib/kakao.ts`에서 선언.
- GPS는 **HTTPS 환경에서만** 동작한다. 로컬 개발 시 `localhost` 또는 ngrok 사용.

### Supabase

- 개발 초기에는 RLS 비활성화 → Phase 10(T-057)에서 활성화 후 검증.
- `session_key`는 `localStorage`에 저장된 `crypto.randomUUID()` 값으로 사용자 식별.
- `participant_locations`는 참여자당 1개 레코드만 유지 (upsert 방식).

### 모바일 필수 대응

- 모든 인터랙티브 요소 터치 영역: 최소 **44×44px**.
- `h-dvh` 사용 (모바일 주소창 변화 대응).
- iOS Safe Area: `env(safe-area-inset-bottom)` 필수 적용.
- `overscroll-behavior: contain` — BottomSheet 내부 스크롤이 페이지로 전파되지 않도록.

---

## 개발 현황

| 항목                          | 상태    |
| ----------------------------- | ------- |
| 문서 작성 (PRD, DESIGN, TASK) | ✅ 완료 |
| 프로젝트 세팅 (Phase 1)       | ✅ 완료 |
| 라우팅 및 레이아웃 (Phase 2)  | ✅ 완료 |
| Supabase 세팅 (Phase 3)       | ✅ 완료 |
| 약속 기능 (Phase 4)           | ✅ 완료 |
| 지도 기능 (Phase 5)           | ✅ 완료 |
| 실시간 위치 공유 (Phase 6)    | ✅ 완료 |
| 지각 판단 기능 (Phase 7)      | ✅ 완료 |
| 타임라인 기능 (Phase 8)       | ✅ 완료 |
| UI/UX 개선 (Phase 9)          | ✅ 완료 |
| 리팩토링 및 최적화 (Phase 10) | ✅ 완료 |
| 배포 후 개선 (Phase 11)       | ✅ 완료 |
