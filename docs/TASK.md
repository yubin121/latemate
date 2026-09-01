# TASK.md: LateMate 개발 작업 목록

> **버전**: 0.1.0  
> **작성일**: 2026-05-17  
> **기준 문서**: PRD.md v0.1.0, DESIGN.md v0.2.0  
> **개발 방식**: 1인 개발, MVP 우선, 프론트엔드 중심

---

## 범례

### 난이도

| 표시      | 의미                                         |
| --------- | -------------------------------------------- |
| 🟢 Easy   | 30분~1시간. 설정, 단순 UI, 유틸 함수         |
| 🟡 Medium | 1~3시간. 로직 포함 컴포넌트, API 연동        |
| 🔴 Hard   | 3~6시간. 복합 로직, 외부 SDK 연동, 상태 통합 |

### 우선순위

| 표시 | 의미                      |
| ---- | ------------------------- |
| P0   | 없으면 앱이 동작하지 않음 |
| P1   | 핵심 기능. MVP 요건       |
| P2   | 품질·완성도 향상          |

### 상태

```
[ ] 대기
[~] 진행 중
[x] 완료
```

---

## 전체 작업 현황

| Phase                         | 작업 수  | 예상 소요 |
| ----------------------------- | -------- | --------- |
| Phase 1 — 프로젝트 세팅       | 6개      | 0.5일     |
| Phase 2 — 라우팅 및 레이아웃  | 6개      | 1일       |
| Phase 3 — Supabase 세팅       | 6개      | 1일       |
| Phase 4 — 약속 기능           | 8개      | 2일       |
| Phase 5 — 지도 기능           | 5개      | 1.5일     |
| Phase 6 — 실시간 위치 공유    | 7개      | 2일       |
| Phase 7 — 지각 판단 기능      | 6개      | 1.5일     |
| Phase 8 — 타임라인 기능       | 4개      | 1일       |
| Phase 9 — UI/UX 개선          | 7개      | 1.5일     |
| Phase 10 — 리팩토링 및 최적화 | 5개      | 1일       |
| Phase 11 — 배포 후 개선       | 18개     | 추가 작업 |
| **합계**                      | **78개** | **~13일** |

---

## Phase 1 — 프로젝트 세팅

> 목표: 개발 환경 구성 완료. 이후 모든 Phase의 선행 조건.

---

### T-001 · Vite + React + TypeScript 초기화 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P0
- **선행 작업**: 없음

**작업 설명**  
Vite로 React + TypeScript 프로젝트를 생성한다. 불필요한 보일러플레이트를 정리하고 기본 실행을 확인한다.

```bash
npm create vite@latest . -- --template react-ts
npm install && npm run dev
```

정리 대상: `src/App.css`, `src/assets/react.svg`, `App.tsx` 기본 내용

**기대 결과물**

- `npm run dev` 실행 시 빈 화면 렌더링 확인
- TypeScript strict mode 활성화 (`tsconfig.json`)

---

### T-002 · 패키지 설치 및 기본 설정 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P0
- **선행 작업**: T-001

**작업 설명**  
프로젝트에서 사용하는 모든 패키지를 한 번에 설치한다.

```bash
# 핵심 패키지
npm install react-router-dom @tanstack/react-query zustand

# UI & 스타일
npm install lucide-react clsx tailwind-merge

# Supabase
npm install @supabase/supabase-js

# 개발 도구
npm install -D tailwindcss @tailwindcss/vite autoprefixer
```

**기대 결과물**

- `package.json`에 전체 의존성 기록
- `npm run dev` 정상 실행 유지

---

### T-003 · TailwindCSS 디자인 토큰 설정 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P0
- **선행 작업**: T-002

**작업 설명**  
DESIGN.md 섹션 15.11의 `tailwind.config.ts` 완성본을 적용한다. Pretendard 폰트 CDN을 `index.html`에 추가한다.

설정 내용:

- 브랜드 컬러 (`brand.600: #4F46E5`)
- 상태 컬러 (`status.on-time`, `late`, `arrived`, `unknown`)
- 서피스 컬러 (`surface.page: #F7F8FC`)
- 커스텀 애니메이션 5개 (`live-pulse`, `ripple`, `shake-once`, `slide-up`)
- `spring` 이징 커브
- `index.css`에 Pretendard 폰트 적용

**기대 결과물**

- `tailwind.config.ts` 완성
- `index.css` 전역 폰트 설정
- Tailwind 커스텀 클래스 동작 확인 (`animate-live-pulse` 등)

---

### T-004 · 폴더 구조 및 경로 별칭 설정 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P0
- **선행 작업**: T-001

**작업 설명**  
DESIGN.md 섹션 2의 폴더 구조대로 디렉토리를 생성한다. `vite.config.ts`에 `@/` 경로 별칭을 설정한다.

생성할 폴더:

```
src/pages/ src/features/ src/components/ui/ src/components/layout/
src/hooks/ src/stores/ src/lib/api/ src/types/ src/constants/ src/utils/
```

`vite.config.ts` 별칭:

```typescript
resolve: { alias: { '@': path.resolve(__dirname, './src') } }
```

**기대 결과물**

- 폴더 구조 완성
- `import { cn } from '@/utils/cn'` 형태로 import 가능

---

### T-005 · 환경 변수 설정 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P0
- **선행 작업**: T-001

**작업 설명**  
`.env.local` 파일을 생성하고 필요한 키 목록을 `.env.example`로 커밋한다. 각 키의 발급 위치를 주석으로 기록한다.

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_KAKAO_MAP_KEY=
VITE_KAKAO_REST_API_KEY=
```

**기대 결과물**

- `.env.local` (gitignore 처리)
- `.env.example` (커밋 포함)
- `import.meta.env.VITE_*` 타입 정의 (`vite-env.d.ts`)

---

### T-006 · 공통 유틸 함수 작성 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P0
- **선행 작업**: T-004

**작업 설명**  
프로젝트 전반에서 쓰이는 순수 유틸 함수 3개를 작성한다.

```
utils/cn.ts          clsx + tailwind-merge 래퍼
utils/formatTime.ts  시각 포맷 (HH:MM, 상대 시간 등)
utils/distance.ts    Haversine 공식 거리 계산 (두 좌표 간 미터)
constants/index.ts   ARRIVAL_RADIUS_M=100, POLLING_INTERVAL=7000, ETA_INTERVAL=30000
```

**기대 결과물**

- 각 함수에 대한 간단한 동작 확인 (console 또는 브라우저 확인)
- `haversineDistance({ lat, lng }, { lat, lng })` → 미터 단위 숫자 반환

---

## Phase 2 — 라우팅 및 레이아웃

> 목표: 페이지 이동 구조와 모바일/데스크탑 레이아웃 골격 완성.

---

### T-007 · React Router 라우팅 구조 설정 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P0
- **선행 작업**: T-002

**작업 설명**  
`createBrowserRouter`로 4개 라우트를 설정한다. 각 페이지 컴포넌트는 빈 껍데기(placeholder)로 먼저 생성한다.

```
/                    → HomePage
/create              → CreatePage
/join/:appointmentId → JoinPage
/appointment/:appointmentId → AppointmentPage (SessionGuard 감싸기)
```

`main.tsx`에 `QueryClientProvider` + `RouterProvider` 를 함께 설정한다.

**기대 결과물**

- 각 경로 접속 시 해당 페이지 컴포넌트 렌더링 확인
- 잘못된 경로 접속 시 홈으로 이동하는 fallback 라우트

---

### T-008 · SessionGuard 컴포넌트 구현 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P0
- **선행 작업**: T-007, T-016 (sessionStore)

**작업 설명**  
`/appointment/:id` 진입 시 `sessionStore`에 현재 약속의 세션이 있는지 확인한다. 없으면 `/join/:id`로 리다이렉트한다.

주의: `appointmentId`가 다른 약속의 세션인 경우도 미입장으로 처리한다.

**기대 결과물**

- 세션 없이 `/appointment/:id` 접속 → `/join/:id` 리다이렉트
- 세션 있으면 그대로 AppointmentPage 렌더링

---

### T-009 · 공통 UI 컴포넌트 구현 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P0
- **선행 작업**: T-003, T-006

**작업 설명**  
DESIGN.md 섹션 10, 15.9를 기반으로 재사용 UI 컴포넌트를 구현한다. 각 컴포넌트는 독립적으로 동작하며 외부 상태에 의존하지 않는다.

구현 목록:

```
Button     variant(primary/secondary/ghost/danger) × size(sm/md/lg) + loading
Input      label, error, placeholder, suffix 슬롯
Avatar     nickname → 이니셜 + 결정론적 컬러
StatusBadge status × etaMinutesLate → 아이콘 + 텍스트 + 색상
Spinner    sm/md/lg 크기
```

**기대 결과물**

- 각 컴포넌트가 props 변화에 따라 올바른 스타일로 렌더링
- `disabled`, `loading` 상태 정상 동작

---

### T-010 · Toast 시스템 구현 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P1
- **선행 작업**: T-003, T-006

**작업 설명**  
에러/성공 알림을 화면 하단에 표시하는 Toast를 구현한다. 외부 라이브러리 없이 직접 구현한다.

구조:

- `useToast` 훅: `showToast({ message, type })` 호출
- `ToastContainer`: `main.tsx` 최상단에 마운트
- 2초 후 자동 제거, fade-out 애니메이션

**기대 결과물**

- `showToast({ message: '복사됐어요!', type: 'success' })` 호출 시 화면 하단에 토스트 표시
- 2초 후 자동 사라짐

---

### T-011 · MobileLayout & BottomSheet 구현 [x]

- **난이도**: 🔴 Hard
- **우선순위**: P0
- **선행 작업**: T-003

**작업 설명**  
모바일 핵심 레이아웃을 구현한다. BottomSheet는 터치 드래그로 3개 스냅 포인트(`collapsed`, `half`, `full`) 사이를 이동한다.

구현 내용:

- `MobileLayout`: 헤더(fixed) + 지도(나머지 높이) + BottomSheet
- `BottomSheet`: touch 이벤트 기반 드래그, `overscroll-behavior: contain`, CSS `transform: translateY` 애니메이션, `spring` 이징으로 스냅
- iOS Safe Area: `pb-safe` (env(safe-area-inset-bottom))

**기대 결과물**

- 모바일에서 BottomSheet를 위아래로 드래그하면 3단계 높이 스냅
- 드래그 중 지도 영역이 함께 수축/확장

---

### T-012 · SplitLayout 구현 [x] (데스크탑)

- **난이도**: 🟢 Easy
- **우선순위**: P2
- **선행 작업**: T-003

**작업 설명**  
768px 이상에서 표시되는 좌측 사이드바(320px) + 우측 지도 2열 레이아웃을 구현한다.

`useMediaQuery` 훅으로 `AppointmentPage`에서 분기 처리:

```tsx
const isMobile = useMediaQuery('(max-width: 767px)');
return isMobile ? <MobileLayout /> : <SplitLayout />;
```

**기대 결과물**

- 768px 이상에서 사이드바 + 지도 2열 레이아웃 렌더링
- 리사이즈 시 모바일/데스크탑 레이아웃 전환

---

## Phase 3 — Supabase 세팅

> 목표: DB 스키마, RLS 정책, 클라이언트 초기화, 전역 상태 스토어 완성.

---

### T-013 · Supabase 프로젝트 설정 및 클라이언트 초기화 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P0
- **선행 작업**: T-005

**작업 설명**  
Supabase 대시보드에서 프로젝트를 생성하고 `lib/supabase.ts`에 클라이언트 싱글톤을 작성한다.

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

**기대 결과물**

- Supabase 프로젝트 생성 완료
- `supabase.from('appointments').select('*')` 호출 시 에러 없음 확인

---

### T-014 · DB 스키마 마이그레이션 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P0
- **선행 작업**: T-013

**작업 설명**  
DESIGN.md 섹션 18의 DDL을 Supabase SQL Editor에서 실행한다. 4개 테이블과 인덱스를 생성한다.

```sql
appointments       -- 약속 (invite_code 유니크 인덱스)
participants       -- 참여자 (appointment_id + nickname 복합 유니크)
participant_locations -- 최신 위치 (participant_id PK, upsert 전용)
timeline_events    -- 타임라인 이벤트 (occurred_at DESC 인덱스)
```

**기대 결과물**

- Supabase 대시보드에서 4개 테이블 확인
- Table Editor에서 수동 insert/select 동작 확인

---

### T-015 · RLS 정책 설정 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P1
- **선행 작업**: T-014

**작업 설명**  
DESIGN.md 섹션 18의 RLS 정책을 적용한다. MVP에서는 `session_key` 기반 간단 정책으로 시작한다.

MVP 단순화 방안: 개발 초기에는 RLS를 비활성화하고 기능 구현에 집중한다. Phase 10에서 정책을 적용하고 검증한다.

**기대 결과물**

- 개발 중: RLS 비활성화 상태로 빠른 개발
- 배포 전: RLS 정책 활성화 및 동작 검증

---

### T-016 · Zustand 스토어 구현 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P0
- **선행 작업**: T-002, T-017

**작업 설명**  
DESIGN.md 섹션 8의 두 스토어를 구현한다.

`sessionStore`:

- `participantId`, `nickname`, `appointmentId`, `isHost`
- `persist` 미들웨어로 localStorage에 저장
- `setSession`, `clearSession`

`locationStore`:

- `isSharing`, `currentCoords`, `accuracy`, `error`, `watchId`
- persist 없음 (메모리만)
- `startSharing`, `stopSharing`, `setCoords`, `setError`, `setWatchId`

**기대 결과물**

- 브라우저 새로고침 후 `sessionStore` 세션 데이터 유지
- `locationStore`는 새로고침 시 초기화

---

### T-017 · TypeScript 공통 타입 정의 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P0
- **선행 작업**: T-004

**작업 설명**  
DESIGN.md 섹션 16의 타입을 `types/index.ts`에 작성한다. 이후 모든 파일이 이 타입을 import해서 사용한다.

```typescript
(Appointment, Participant, ParticipantLocation, ParticipantWithLocation);
(TimelineEvent, ParticipantStatus, TimelineEventType);
(CreateAppointmentInput, JoinAppointmentInput);
(Coords, SessionData);
```

**기대 결과물**

- `types/index.ts` 작성 완료
- 모든 타입이 export되어 다른 파일에서 import 가능

---

### T-018 · API 레이어 함수 작성 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P0
- **선행 작업**: T-013, T-014, T-017

**작업 설명**  
DESIGN.md 섹션 9를 기반으로 Supabase 쿼리를 순수 함수로 추상화한다. 훅이나 컴포넌트에서 직접 Supabase를 호출하지 않는 원칙을 지킨다.

```
lib/api/appointments.ts    fetchAppointment, fetchAppointmentByCode, createAppointment
lib/api/participants.ts    joinAppointment, fetchParticipantsWithLocations, restoreSession
lib/api/locations.ts       upsertParticipantLocation, stopSharingLocation
lib/api/timeline.ts        insertTimelineEvent, fetchTimeline
lib/api/kakaoDirections.ts fetchEtaSeconds (Kakao REST API 호출)
```

**기대 결과물**

- 각 함수 호출 시 Supabase에 올바른 쿼리가 실행됨을 대시보드에서 확인

---

## Phase 4 — 약속 기능

> 목표: 약속 생성 → 참여 → 약속 화면 진입까지 전체 흐름 완성.

---

### T-019 · HomePage UI 구현 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P0
- **선행 작업**: T-007, T-009

**작업 설명**  
DESIGN.md 섹션 15.8의 홈 페이지 와이어프레임대로 UI를 구현한다.

구성:

- 로고 (`MapPin` 아이콘 + "LateMate" 텍스트)
- 슬로건 텍스트
- `[약속 만들기]` 버튼 → `/create` 이동
- 구분선 ("또는 코드로 참여")
- 초대 코드 입력 필드 (6자리, `font-mono`, `tracking-widest`)
- `[참여하기]` 버튼 → 코드 유효성 확인 후 `/join/:id` 이동

**기대 결과물**

- DESIGN.md와 동일한 레이아웃 렌더링
- 6자리 숫자 외 입력 시 버튼 비활성화

---

### T-020 · CreatePage 폼 UI 구현 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P0
- **선행 작업**: T-009, T-011

**작업 설명**  
약속 생성 폼을 구현한다. 각 필드를 `useState`로 관리한다. 제출 전 유효성 검사를 인라인으로 표시한다.

필드:

- 약속 제목: `Input`, 최대 50자, 실시간 글자 수 표시
- 약속 장소: 검색 Input + 결과 드롭다운 (T-021 연동)
- 약속 시간: `datetime-local` input, 현재 시각 이후만 허용
- 하단 고정 `[약속 만들기]` CTA 버튼

유효성 검사 조건:

- 제목: 1자 이상
- 장소: 검색 결과에서 선택된 경우만 유효
- 시간: 현재 시각 이후

**기대 결과물**

- 필드 미입력 시 CTA 버튼 비활성화
- 각 필드 오류 시 인라인 에러 텍스트 표시

---

### T-021 · Kakao Local API 장소 검색 연동 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P0
- **선행 작업**: T-020

**작업 설명**  
Kakao Local 검색 API를 통해 장소를 검색하고 결과를 드롭다운으로 표시한다.

구현 내용:

- 입력 후 300ms debounce 적용 → API 호출
- 결과 목록 표시: 장소명 + 주소
- 선택 시 `placeName`, `lat`, `lng` 폼 상태 저장
- 선택 완료 표시: 입력창이 선택된 장소명으로 전환, `MapPin` 아이콘 + `indigo-50` 배경

```typescript
// lib/api/kakaoLocal.ts
export async function searchPlaces(query: string): Promise<KakaoPlace[]>;
```

**기대 결과물**

- "강남역" 입력 시 관련 장소 목록 드롭다운 표시
- 선택 후 폼에 좌표 저장 확인

---

### T-022 · 약속 생성 Mutation 및 Supabase 연동 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P0
- **선행 작업**: T-018, T-020, T-016

**작업 설명**  
`useMutation`으로 약속 생성을 처리한다. 성공 시 세션 저장 + 라우팅을 처리한다.

```typescript
// hooks/useCreateAppointment.ts
useMutation({
  mutationFn: createAppointment, // lib/api/appointments.ts
  onSuccess: (appointment) => {
    // participants에 주최자 insert
    // sessionStore에 세션 저장 (isHost: true)
    // /appointment/:id 이동
  },
  onError: () =>
    showToast({ message: '약속 생성에 실패했어요', type: 'error' }),
});
```

**기대 결과물**

- 폼 제출 → Supabase `appointments` + `participants` insert 확인
- 생성 후 `/appointment/:id`로 이동

---

### T-023 · 초대 링크/코드 공유 UI [x]

- **난이도**: 🟡 Medium
- **우선순위**: P0
- **선행 작업**: T-022

**작업 설명**  
약속 생성 완료 후 공유 UI를 표시한다. DESIGN.md 섹션 15.9의 초대 코드 공유 UI를 구현한다.

구현 내용:

- 6자리 코드 대형 표시 (`font-mono`, `text-3xl`, `tracking-[0.4em]`)
- `[링크 복사]` 버튼: 클릭 → 클립보드 저장 → "복사됐어요!" 피드백 2초 (T-010 연동)
- `[약속 화면으로 →]` 버튼

**기대 결과물**

- 링크 복사 클릭 시 URL이 클립보드에 저장됨
- 버튼 텍스트가 "복사됐어요!"로 2초간 변경

---

### T-024 · JoinPage UI 구현 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P0
- **선행 작업**: T-007, T-009, T-018

**작업 설명**  
DESIGN.md 섹션 15.8의 JoinPage 와이어프레임대로 구현한다.

구성:

- 약속 정보 미리보기 카드 (제목, 장소, 시간) → `useAppointment` 훅 연동
- 약속 상단 인디고 컬러 스트라이프 (4px)
- 닉네임 입력 필드 (autofocus, 최대 10자)
- 입력값 엔터키로 제출 가능
- `[참여하기]` CTA 버튼

예외 처리:

- 약속 없음 → "약속을 찾을 수 없어요" + 홈으로 이동 버튼
- 약속 만료 → "종료된 약속이에요" 안내

**기대 결과물**

- 초대 링크 접속 시 약속 정보 카드 렌더링
- 닉네임 입력 후 참여하기 클릭 가능

---

### T-025 · 약속 참여 Mutation 및 세션 저장 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P0
- **선행 작업**: T-018, T-024, T-016

**작업 설명**  
닉네임 입력 후 참여를 처리한다. localStorage UUID를 `session_key`로 사용한다.

```typescript
// hooks/useJoinAppointment.ts
// 1. session_key = localStorage.getItem('latemate_session') ?? crypto.randomUUID()
// 2. participants insert (appointment_id, nickname, session_key)
// 3. sessionStore.setSession(...)
// 4. navigate('/appointment/:id')
```

에러 처리:

- 닉네임 중복 → Supabase unique 제약 오류 → "이미 사용 중인 닉네임이에요" 인라인 표시

**기대 결과물**

- 참여 성공 → `/appointment/:id` 이동
- 닉네임 중복 시 인라인 에러 표시 (페이지 이동 없음)

---

### T-026 · 세션 복구 로직 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P1
- **선행 작업**: T-025, T-018

**작업 설명**  
동일 기기에서 `/join/:id` 재접속 시 기존 세션을 복구한다.

```typescript
// JoinPage 진입 시:
// 1. localStorage에서 session_key 확인
// 2. participants 테이블에서 session_key + appointment_id 일치하는 레코드 조회
// 3. 존재하면 sessionStore 복구 + /appointment/:id 자동 이동
// 4. 없으면 닉네임 입력 화면 표시
```

**기대 결과물**

- 브라우저 새로고침 → JoinPage 접속 → 자동으로 AppointmentPage 이동
- 다른 기기에서 같은 링크 접속 → 닉네임 입력 화면 표시

---

## Phase 5 — 지도 기능

> 목표: Kakao Maps 지도 렌더링과 마커 동기화 완성.

---

### T-027 · Kakao Maps SDK 초기화 및 기본 지도 렌더링 [x]

- **난이도**: 🔴 Hard
- **우선순위**: P0
- **선행 작업**: T-005, T-011

**작업 설명**  
`index.html`에 Kakao Maps SDK 스크립트를 추가하고, React 컴포넌트 내에서 안전하게 초기화한다.

```html
<!-- index.html -->
<script
  type="text/javascript"
  src="//dapi.kakao.com/v2/maps/sdk.js?appkey=${VITE_KAKAO_MAP_KEY}&autoload=false"
></script>
```

```typescript
// features/map/AppointmentMap.tsx
useEffect(() => {
  kakao.maps.load(() => {
    // Map 인스턴스 생성, ref에 저장
  });
}, []);
```

주의사항:

- `kakao.maps.load()` 콜백 내에서만 SDK 사용 가능
- 컴포넌트 재마운트 시 중복 초기화 방지 (`mapInstanceRef.current` 체크)
- `window.kakao` TypeScript 타입 선언 (`lib/kakao.ts`)

**기대 결과물**

- AppointmentPage 진입 시 약속 장소 중심의 카카오 지도 렌더링
- 지도 드래그/줌 동작 확인

---

### T-028 · 목적지 마커 구현 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P0
- **선행 작업**: T-027

**작업 설명**  
DESIGN.md 섹션 15.9의 목적지 마커를 Kakao `CustomOverlay`로 구현한다.

```typescript
// features/map/DestinationMarker.tsx
// CustomOverlay로 HTML 마커 생성
// 인디고 원형 배경 + 🏁 이모지 + "목적지" 라벨
// 마커는 지도 초기화 시 1회만 생성
```

**기대 결과물**

- 약속 장소 좌표에 커스텀 목적지 마커 표시
- 기본 카카오 마커와 시각적으로 구분

---

### T-029 · 참여자 마커 동적 렌더링 [x]

- **난이도**: 🔴 Hard
- **우선순위**: P0
- **선행 작업**: T-027, T-028

**작업 설명**  
DESIGN.md 섹션 15.9의 참여자 마커를 동적으로 생성한다. 위치 polling 결과가 변경될 때마다 마커를 동기화한다.

```typescript
// 마커 동기화 전략 (DESIGN.md 섹션 12 참고)
// - Map<participantId, CustomOverlay> 로 마커 인스턴스 관리
// - 기존 마커: setPosition()으로 위치만 업데이트 (DOM 재생성 없음)
// - 신규 참여자: CustomOverlay 생성 후 Map에 추가
// - 퇴장 참여자: setMap(null) 후 Map에서 제거
```

마커 내용: 이니셜 원형 + 상태별 컬러 + 닉네임 라벨 + live-pulse 점 (공유 중)

**기대 결과물**

- 각 참여자의 현재 위치에 맞는 커스텀 마커 렌더링
- polling 갱신 시 마커 위치 부드럽게 이동

---

### T-030 · AppointmentHeader 구현 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P0
- **선행 작업**: T-009

**작업 설명**  
약속 화면 상단에 고정 표시되는 헤더를 구현한다.

구성:

- 약속 제목 (`text-base font-bold`)
- 약속 시간까지 남은 시간 카운트다운 (`HH:MM:SS`, `font-mono`, `text-brand-600`)
- 약속 장소명 (`text-xs text-gray-500`, `MapPin` 아이콘)
- 카운트다운은 `useEffect` + 1초 `setInterval`로 갱신

**기대 결과물**

- 헤더 고정 표시 + 카운트다운 1초마다 갱신
- 약속 시간 경과 후 "약속 시간이 지났어요" 표시

---

### T-031 · 지도 Bounds 자동 조정 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P1
- **선행 작업**: T-027, T-029

**작업 설명**  
모든 참여자 위치 + 목적지가 지도 화면에 보이도록 `bounds`를 자동 조정한다.

```typescript
// 참여자 위치가 변경될 때마다 실행
// kakao.maps.LatLngBounds로 모든 좌표를 포함하는 영역 계산
// map.setBounds(bounds, 80) 으로 80px 여백을 두고 자동 줌
// 단, 사용자가 지도를 직접 조작한 후에는 자동 조정 중단
```

**기대 결과물**

- 참여자가 멀리 이동해도 지도가 자동으로 전체를 포함
- 사용자가 직접 지도를 움직이면 자동 조정 비활성화

---

## Phase 6 — 실시간 위치 공유

> 목표: GPS 위치 추적 → Supabase 업로드 → 다른 참여자 화면에 반영까지 전체 흐름 완성.

---

### T-032 · useGeolocation 훅 구현 [x]

- **난이도**: 🔴 Hard
- **우선순위**: P0
- **선행 작업**: T-006, T-016

**작업 설명**  
DESIGN.md 섹션 13의 `useGeolocation` 훅을 구현한다. 위치 변화량과 시간 기반으로 Supabase 업로드를 최적화한다.

```typescript
// hooks/useGeolocation.ts
export function useGeolocation() {
  // navigator.geolocation.watchPosition 으로 GPS 추적
  // 위치 변화 시 locationStore.setCoords() 즉시 호출 (UI 즉각 반영)
  // 업로드 조건: 이동 거리 > 10m OR 마지막 업로드 후 10초 초과
  // 업로드: useUpdateLocation mutation 호출 (T-034)
}
```

옵션:

```typescript
{ enableHighAccuracy: true, timeout: 5000, maximumAge: 3000 }
```

에러 처리:

- `PERMISSION_DENIED`: `locationStore.setError()` → LocationPermission UI 표시
- `TIMEOUT`: 재시도 없이 이전 위치 유지

**기대 결과물**

- "위치 공유 시작" 클릭 → GPS 추적 시작 → 콘솔에 좌표 출력 확인
- 권한 거부 시 에러 상태 저장 확인

---

### T-033 · useUpdateLocation Mutation 구현 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P0
- **선행 작업**: T-018, T-017

**작업 설명**  
위치 데이터를 Supabase에 upsert하는 mutation을 구현한다.

```typescript
// hooks/useUpdateLocation.ts
useMutation({
  mutationFn: ({ participantId, coords, etaSeconds, status }) =>
    upsertParticipantLocation(participantId, coords, etaSeconds, status),
  // 에러 시: 조용히 실패 (Toast 없음, 다음 업로드에서 재시도)
  retry: 1,
});
```

**기대 결과물**

- `participant_locations` 테이블에 upsert 확인 (Supabase 대시보드)
- 위치 이동 시 `updated_at` 갱신 확인

---

### T-034 · useParticipants 폴링 훅 구현 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P0
- **선행 작업**: T-018, T-017

**작업 설명**  
7초 간격으로 모든 참여자 + 위치 데이터를 polling하는 훅을 구현한다.

```typescript
// hooks/useParticipants.ts
useQuery({
  queryKey: ['participants', appointmentId],
  queryFn: () => fetchParticipantsWithLocations(appointmentId),
  refetchInterval: POLLING_INTERVAL, // 7000ms
  refetchIntervalInBackground: false, // 탭 비활성 시 polling 중단
  enabled: !!appointmentId,
});
```

반환 데이터: `ParticipantWithLocation[]` — 도착 완료 참여자를 마지막으로 정렬

**기대 결과물**

- 7초마다 Supabase에서 최신 참여자 위치 데이터 수신 확인
- 다른 탭에서 위치 변경 → 7초 내 현재 탭에 반영

---

### T-035 · LocationControl 컴포넌트 구현 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P0
- **선행 작업**: T-032, T-009

**작업 설명**  
DESIGN.md 섹션 15.9의 LocationControl 3가지 상태를 구현한다.

```
[미공유] → 인디고 배경 "위치 공유 시작하기" 버튼
[공유 중] → 에메랄드 배경 "위치 공유 중 · 중지하기" + live-pulse 점
[권한 거부] → 앰버 배경 "위치 권한이 필요해요" + LocationPermission 안내
```

중지 클릭 시:

- `locationStore.stopSharing()` → `navigator.geolocation.clearWatch(watchId)`
- Supabase `is_sharing: false` 업데이트

**기대 결과물**

- 버튼 클릭으로 3가지 상태 전환
- 공유 중 상태에서 live-pulse 애니메이션 동작

---

### T-036 · LocationPermission 안내 화면 구현 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P1
- **선행 작업**: T-009

**작업 설명**  
위치 권한 거부 시 표시되는 안내 UI를 구현한다.

내용:

- `NavigationOff` 아이콘 (회색)
- "위치 공유 없이도 다른 참여자의 위치는 볼 수 있어요"
- "위치를 공유하려면 브라우저 설정에서 권한을 허용해주세요"
- iOS Safari 권한 설정 경로 안내 (접기/펼치기)

**기대 결과물**

- 권한 거부 상태에서 LocationPermission 안내 표시
- 서비스는 계속 사용 가능 (지도 + 다른 참여자 위치 보기)

---

### T-037 · ParticipantList & ParticipantCard 구현 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P0
- **선행 작업**: T-009, T-034

**작업 설명**  
DESIGN.md 섹션 15.9의 ParticipantCard 4가지 상태를 구현한다.

`ParticipantCard` props: `participant: ParticipantWithLocation`

표시 내용:

- `Avatar` (닉네임 이니셜)
- 닉네임 + 본인 표시 "(나)"
- `StatusBadge` (on_time / late / arrived / unknown)
- ETA: "N분 후 도착" 또는 "도착" 또는 "-"
- 좌측 컬러 바 (`border-l-2`) — 상태별 색상

정렬 순서: 도착 → 정시 → 지각 → 위치없음

**기대 결과물**

- polling 데이터로 참여자 목록 렌더링
- 상태 변경 시 카드 스타일 실시간 변경

---

## Phase 7 — 지각 판단 기능

> 목표: ETA 계산 → 지각 판단 → 도착 감지까지 자동화.

---

### T-038 · Kakao Directions API 연동 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P0
- **선행 작업**: T-018

**작업 설명**  
DESIGN.md 섹션 9의 `kakaoDirections.ts`를 구현한다.

```typescript
// lib/api/kakaoDirections.ts
// Kakao Mobility Directions v1 API 호출
// Authorization: KakaoAK {REST_KEY}
// origin/destination을 "lng,lat" 형식으로 전달
// 응답에서 routes[0].summary.duration (초) 추출
// 경로 없음 / API 오류 시 명시적 Error throw
```

**기대 결과물**

- 두 좌표 입력 → 이동 소요 시간(초) 반환
- Kakao 대시보드에서 API 호출 로그 확인

---

### T-039 · useEta 훅 구현 [x]

- **난이도**: 🔴 Hard
- **우선순위**: P0
- **선행 작업**: T-038, T-033, T-006

**작업 설명**  
30초 interval로 ETA를 계산하고 지각 상태를 Supabase에 업데이트하는 훅을 구현한다.

```typescript
// hooks/useEta.ts
// currentCoords가 변경될 때마다 즉시 1회 실행 + 30초 interval 설정
// fetchEtaSeconds(currentCoords, destination) 호출
// 상태 판단: isWithinRadius → 'arrived' | etaTime > scheduled + 5분 → 'late' | else → 'on_time'
// useUpdateLocation.mutate({ etaSeconds, status }) 호출
// API 오류 시 조용히 실패 (이전 상태 유지)
```

컴포넌트 마운트 해제 시 interval 정리 (메모리 누수 방지)

**기대 결과물**

- 위치 공유 시작 후 30초마다 Supabase `eta_seconds`, `status` 업데이트 확인
- 목적지 근처 이동 시 `arrived`로 전환

---

### T-040 · 도착 감지 로직 구현 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P0
- **선행 작업**: T-006, T-039

**작업 설명**  
`haversineDistance`를 사용해 현재 위치가 목적지 100m 이내인지 확인한다. 도착 감지 시 타임라인 이벤트를 자동 생성한다.

```typescript
// useEta 내부 또는 별도 useArrivalDetect 훅
// 도착 상태로 전환 시 1회만 ARRIVED 타임라인 이벤트 insert
// 이미 도착 상태라면 재삽입 방지 (ref로 추적)
```

**기대 결과물**

- 목적지 100m 이내 진입 시 `status: 'arrived'`로 자동 전환
- 타임라인에 ARRIVED 이벤트 기록 확인

---

### T-041 · 지각 예상 전환 시 LATE_ALERT 이벤트 기록 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P1
- **선행 작업**: T-039, T-045

**작업 설명**  
`on_time` → `late` 상태로 처음 전환될 때 `LATE_ALERT` 이벤트를 타임라인에 한 번만 기록한다.

```typescript
// useEta 내에서 prevStatus ref와 비교
// prevStatus !== 'late' && newStatus === 'late' → insertTimelineEvent('LATE_ALERT')
```

**기대 결과물**

- 지각 예상 전환 시 타임라인에 "지각 예상이에요" 이벤트 1회 기록
- 이미 late 상태일 때 재전환해도 이벤트 중복 생성 없음

---

### T-042 · 지각 상태 배지 전환 애니메이션 적용 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P2
- **선행 작업**: T-039, T-003

**작업 설명**  
`StatusBadge`에 상태 변경 시 `shake-once` 애니메이션을 적용한다. `status` prop이 변경될 때마다 애니메이션을 트리거한다.

```typescript
// status가 변경될 때 animate 클래스를 추가 후 제거
const [isAnimating, setIsAnimating] = useState(false);
useEffect(() => {
  setIsAnimating(true);
  const t = setTimeout(() => setIsAnimating(false), 400);
  return () => clearTimeout(t);
}, [status]);
```

**기대 결과물**

- 정시 → 지각으로 상태 변경 시 배지가 짧게 흔들림
- 지각 배지가 빨간색으로 전환됨

---

### T-043 · 출발 이벤트 자동 기록 (DEPARTED) [x]

- **난이도**: 🟢 Easy
- **우선순위**: P1
- **선행 작업**: T-045, T-035

**작업 설명**  
"위치 공유 시작" 클릭 시 `DEPARTED` 타임라인 이벤트를 자동으로 기록한다. `LocationControl`의 `start` 핸들러에서 호출한다.

```typescript
// LocationControl.tsx
const handleStart = async () => {
  await insertTimelineEvent({
    appointmentId,
    participantId,
    eventType: 'DEPARTED',
  });
  start(); // useGeolocation.start()
};
```

**기대 결과물**

- "위치 공유 시작" 클릭 → 타임라인에 "OO이 출발했어요" 이벤트 즉시 표시

---

## Phase 8 — 타임라인 기능

> 목표: 이벤트 기록 → 타임라인 UI 완성.

---

### T-044 · useTimeline 폴링 훅 구현 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P1
- **선행 작업**: T-018

**작업 설명**  
10초 간격으로 타임라인 이벤트를 polling하는 훅을 구현한다.

```typescript
// hooks/useTimeline.ts
useQuery({
  queryKey: ['timeline', appointmentId],
  queryFn: () => fetchTimeline(appointmentId),
  refetchInterval: 10_000,
  select: (data) =>
    data.sort(
      (a, b) =>
        new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
    ),
});
```

`fetchTimeline`은 `participants` 조인으로 닉네임도 함께 반환

**기대 결과물**

- 타임라인 이벤트가 최신 순으로 렌더링
- 10초 내 새 이벤트 반영

---

### T-045 · Timeline & TimelineEvent 컴포넌트 구현 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P1
- **선행 작업**: T-009, T-044

**작업 설명**  
DESIGN.md 섹션 15.9의 타임라인 UI를 구현한다.

`Timeline`: 이벤트 목록을 세로 타임라인으로 렌더링

- 세로 연결선: `border-l-2 border-gray-100`
- 이벤트 점: `w-3 h-3 rounded-full`, 타입별 색상

`TimelineEvent`: 개별 이벤트 카드

- 이벤트 타입별 아이콘 + 텍스트
- 발생 시각 (HH:MM 포맷, `formatTime` 유틸)
- LATE_ALERT: 텍스트 `text-red-600`

이벤트 타입별 표시:

```
JOINED     → "OO이 참여했어요"
DEPARTED   → "OO이 출발했어요"
ARRIVED    → "OO이 도착했어요"
LATE_ALERT → "OO이 지각 예상이에요"  (red)
```

**기대 결과물**

- 타임라인 이벤트가 시각적으로 구분되어 렌더링
- LATE_ALERT 이벤트가 빨간색으로 강조

---

### T-046 · JOINED 이벤트 자동 기록 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P1
- **선행 작업**: T-025, T-018

**작업 설명**  
참여자가 약속에 참여(T-025)하는 순간 `JOINED` 이벤트를 자동 생성한다.

```typescript
// useJoinAppointment mutation의 onSuccess에서
insertTimelineEvent({ appointmentId, participantId, eventType: 'JOINED' });
```

**기대 결과물**

- 참여 즉시 "OO이 참여했어요" 이벤트가 타임라인에 등록
- 다른 참여자 화면에 10초 내 반영

---

### T-047 · 빈 타임라인 상태 UI [x]

- **난이도**: 🟢 Easy
- **우선순위**: P2
- **선행 작업**: T-045

**작업 설명**  
이벤트가 없을 때 표시되는 빈 상태 UI를 구현한다.

```
Clock 아이콘 (회색, size-8)
"아직 이벤트가 없어요"
"위치 공유를 시작하면 여기에 기록돼요"
```

**기대 결과물**

- 이벤트 0개 시 빈 상태 안내 표시
- 이벤트 생성 후 자동으로 타임라인으로 전환

---

## Phase 9 — UI/UX 개선

> 목표: 에러 처리, 로딩 상태, 마이크로인터랙션 완성.

---

### T-048 · 로딩 Skeleton UI 구현 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P1
- **선행 작업**: T-003

**작업 설명**  
데이터 로딩 중 표시되는 Skeleton 컴포넌트를 구현한다. `animate-pulse` 적용.

대상:

- JoinPage 약속 정보 카드 로딩 중 → 제목/장소/시간 Skeleton
- AppointmentPage 참여자 목록 로딩 중 → 카드 3개 Skeleton
- AppointmentPage 타임라인 로딩 중 → 이벤트 2개 Skeleton

```tsx
// components/ui/Skeleton.tsx
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-gray-200 rounded-lg animate-pulse', className)} />
  );
}
```

**기대 결과물**

- 데이터 로딩 중 깜빡임 없는 Skeleton 표시
- 데이터 수신 후 자연스럽게 실제 콘텐츠로 전환

---

### T-049 · 에러 화면 구현 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P1
- **선행 작업**: T-009

**작업 설명**  
PRD.md 섹션 13의 에러 유형별 화면을 구현한다.

구현 목록:

- `ErrorScreen`: 중앙 아이콘 + 메시지 + 새로고침/홈으로 버튼
- 약속 만료 화면: "종료된 약속이에요" + 홈으로 이동
- 약속 없음 화면: "약속을 찾을 수 없어요" + 홈으로 이동
- 오프라인 배너: 화면 상단 고정 `"인터넷 연결을 확인해주세요"` (`navigator.onLine` 이벤트)

**기대 결과물**

- 각 에러 상황에 맞는 화면 표시
- 오프라인 → 배너 표시, 온라인 복귀 → 배너 자동 해제

---

### T-050 · 슬라이드업 애니메이션 적용 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P2
- **선행 작업**: T-003, T-037

**작업 설명**  
ParticipantList에 새 참여자가 추가될 때 `animate-slide-up`을 적용한다.

```tsx
// ParticipantCard에 key 기반 애니메이션 트리거
<ParticipantCard
  key={participant.id}
  className="animate-slide-up"
  ...
/>
```

**기대 결과물**

- 새 참여자 입장 시 카드가 아래서 위로 등장
- 기존 카드는 애니메이션 없이 유지

---

### T-051 · 카운트다운 D-Day 표시 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P1
- **선행 작업**: T-030

**작업 설명**  
AppointmentHeader의 카운트다운을 완성한다.

```
약속 24시간 전:  "내일 오후 7:00"
약속 당일:       "D-00:45:30" (HH:MM:SS 카운트다운)
약속 시간 경과:  "약속 시간이 지났어요"
```

1초 `setInterval`로 갱신하며 컴포넌트 언마운트 시 정리.

**기대 결과물**

- 실시간 카운트다운 1초마다 갱신
- 시간 경과 후 텍스트 전환

---

### T-052 · iOS Safe Area & 모바일 최종 점검 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P1
- **선행 작업**: T-011

**작업 설명**  
iOS Safari에서 Safe Area 관련 레이아웃 문제를 해결한다.

체크리스트:

- `viewport-fit=cover` 설정 (`index.html`)
- BottomSheet 하단: `padding-bottom: env(safe-area-inset-bottom)` 적용
- CTA 버튼 하단 고정 시 Safe Area 반영
- `h-dvh` (dynamic viewport height) 사용으로 모바일 브라우저 주소창 변화 대응

**기대 결과물**

- iPhone 노치/홈바 영역에 콘텐츠 겹침 없음
- 주소창 축소/확장 시 레이아웃 깨짐 없음

---

### T-053 · React ErrorBoundary 추가 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P1
- **선행 작업**: T-049

**작업 설명**  
예상치 못한 런타임 에러가 발생할 때 앱 전체가 흰 화면이 되지 않도록 ErrorBoundary를 추가한다.

```tsx
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  // componentDidCatch → ErrorScreen 표시
  // 새로고침 버튼 제공
}
```

라우트 레벨 감싸기:

```tsx
<ErrorBoundary>
  <AppointmentPage />
</ErrorBoundary>
```

**기대 결과물**

- 컴포넌트 내 에러 발생 시 에러 화면 표시 (흰 화면 방지)
- 새로고침 버튼으로 복구 가능

---

### T-054 · AppointmentPage 전체 통합 테스트 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P1
- **선행 작업**: Phase 1~8 전체

**작업 설명**  
전체 흐름을 직접 사용해보며 버그를 발견하고 수정한다.

테스트 시나리오:

1. 약속 생성 → 링크 복사 → 다른 탭에서 링크 접속 → 닉네임 입력 → 위치 공유 시작
2. 두 탭에서 서로의 위치 마커 확인 (7초 갱신)
3. 목적지 근처에서 도착 상태 전환 확인
4. 타임라인 이벤트 기록 확인
5. 브라우저 새로고침 후 세션 복구 확인

**기대 결과물**

- 전체 시나리오 A (PRD.md 섹션 4) 오류 없이 동작
- 발견된 버그 목록 작성 후 수정

**발견 및 수정된 버그**

- `AppointmentMap.tsx` — `window.kakao` undefined 시 `useEffect` 내 TypeError 발생 → React 18이 ErrorBoundary로 전파 → 앱 전체 에러 화면. `typeof window.kakao === 'undefined'` 가드 추가 및 지도 로드 실패 시 fallback UI 표시로 수정.

---

## Phase 10 — 리팩토링 및 최적화

> 목표: 배포 전 성능 최적화, 코드 정리, 실기기 검증.

---

### T-055 · React.memo 최적화 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P2
- **선행 작업**: T-029, T-037

**작업 설명**  
polling으로 자주 리렌더링되는 컴포넌트에 `React.memo`를 적용한다.

대상:

```typescript
// ParticipantCard: lat, lng, status 변경 시에만 리렌더
// ParticipantMarker: 위치/상태 변경 시에만 리렌더 (Custom equality 함수)
// TimelineEvent: 불변 데이터이므로 무조건 memo
```

**기대 결과물**

- React DevTools Profiler에서 불필요한 리렌더 감소 확인
- polling 시 전체 목록이 아닌 변경된 카드만 리렌더

---

### T-056 · 페이지 단위 Lazy Loading [x]

- **난이도**: 🟢 Easy
- **우선순위**: P2
- **선행 작업**: T-007

**작업 설명**  
각 페이지 컴포넌트를 `React.lazy`로 분리해 초기 번들 크기를 줄인다.

```typescript
const AppointmentPage = lazy(() => import('@/pages/AppointmentPage'));
const CreatePage = lazy(() => import('@/pages/CreatePage'));
// <Suspense fallback={<FullPageSpinner />}> 로 감싸기
```

**기대 결과물**

- 빌드 결과물에서 페이지별 청크 분리 확인 (`dist/` 폴더)
- 초기 로드 번들 크기 감소

---

### T-057 · Supabase RLS 정책 활성화 및 검증 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P1
- **선행 작업**: T-015

**작업 설명**  
T-015에서 미뤄둔 RLS 정책을 활성화하고 실제 동작을 검증한다.

검증 방법:

- 다른 약속 참여자가 현재 약속의 위치 데이터를 조회할 수 없는지 확인
- Supabase SQL Editor에서 직접 쿼리로 정책 동작 확인

발생 가능한 문제:

- `session_key` 기반 RLS가 복잡할 경우 → 임시로 `anon` 역할에 SELECT 허용 후 MVP 출시, 이후 개선

**기대 결과물**

- 배포 전 RLS 활성화 상태에서 전체 시나리오 정상 동작 확인

---

### T-058 · 실기기 테스트

- **난이도**: 🟡 Medium
- **우선순위**: P0
- **선행 작업**: Phase 1~9 전체

**작업 설명**  
실제 모바일 기기에서 테스트한다. 에뮬레이터가 아닌 실기기 필수.

테스트 기기 및 환경:

- iPhone Safari (iOS 16+)
- Android Chrome (최신)

테스트 항목:

- GPS 위치 권한 요청 + 허용/거부 흐름
- BottomSheet 드래그 (터치)
- 두 기기 간 실시간 위치 공유 (5~10초 갱신)
- 한 기기를 이동하며 다른 기기에서 마커 이동 확인
- 화면 회전 시 레이아웃 깨짐 여부

**기대 결과물**

- iOS/Android 양쪽에서 핵심 흐름 오류 없이 동작 확인
- 발견된 기기별 버그 수정

---

### T-059 · Vercel 배포 설정 [사용자 직접]

- **난이도**: 🟢 Easy
- **우선순위**: P0
- **선행 작업**: T-057, T-058

**작업 설명**  
Vercel에 프로젝트를 연결하고 환경 변수를 설정한다.

```
vercel.com → New Project → GitHub 연결
Framework: Vite
Build Command: npm run build
Output Dir: dist
Environment Variables: VITE_* 4개 추가
```

`vercel.json` SPA 라우팅 설정:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**기대 결과물**

- `https://latemate.vercel.app` (또는 커스텀 도메인) 접속 가능
- HTTPS 환경에서 GPS 권한 요청 정상 동작 확인

---

### T-060 · 최종 체크리스트 검증

- **난이도**: 🟢 Easy
- **우선순위**: P0
- **선행 작업**: T-059

**작업 설명**  
배포 후 PRD.md의 기능 요구사항 전체를 확인한다.

```
FR-01 ~ FR-18 항목을 하나씩 체크

추가 확인:
[ ] 초대 링크 접속 → 약속 정보 정상 표시
[ ] 닉네임 중복 오류 메시지 표시
[ ] 세션 복구 (새로고침 후 자동 로그인)
[ ] 위치 공유 시작 → 지도 마커 표시 (7초 내)
[ ] ETA 계산 → StatusBadge 상태 변경 (30초 내)
[ ] 도착 100m 이내 → 도착 상태 전환
[ ] 타임라인 이벤트 4종 기록 확인
[ ] 모바일 BottomSheet 드래그 동작
[ ] iOS Safe Area 레이아웃 정상
[ ] 오프라인 시 배너 표시
```

**기대 결과물**

- FR-01 ~ FR-18 전항목 체크 완료
- 미통과 항목은 별도 버그로 기록 후 수정

---

## 작업 의존성 요약

```
T-001 → T-002 → T-003 → T-006
                       ↓
              T-004 → T-009 → T-011 → T-037
                       ↓               ↓
              T-007 → T-019     T-035 → T-032
                       ↓
T-005 → T-013 → T-014 → T-018 → T-022 → T-023
                       ↓
              T-015 → T-016 → T-025 → T-026
                       ↓
              T-017 → T-033 → T-034 → T-038 → T-039
                                              ↓
                                       T-040 → T-041
                                              ↓
                                       T-044 → T-045 → T-046
```

---

## Phase 11 — 배포 후 개선

> 목표: 배포 후 발견된 버그 수정 + 랜딩페이지 신규 구현 + 메타 설정.

---

### T-061 · BottomSheet z-index 버그 수정 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P0
- **선행 작업**: T-011, T-027

**작업 설명**  
Kakao Maps SDK가 내부적으로 높은 z-index를 적용해 BottomSheet가 지도 뒤에 숨는 버그를 수정한다.

**수정 내용**: `BottomSheet.tsx`의 시트 컨테이너에 `z-10` 추가.

---

### T-062 · 날짜 표시 버그 수정 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P1
- **선행 작업**: T-051

**작업 설명**  
약속 날짜가 며칠 후든 항상 "내일"로 표시되던 버그를 수정한다.

**원인**: `diffMs > 24h` 조건이 모든 미래 날짜를 포함해 하루 초과도 "내일"로 처리.  
**수정 내용**: `AppointmentHeader.tsx`에서 달력 날짜 기준 diff 계산으로 변경. dayDiff === 1일 때만 "내일", 그 외 "N일 후" 표시.

---

### T-063 · 위치 마커 미표시 버그 수정 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P0
- **선행 작업**: T-018, T-029

**작업 설명**  
위치 공유를 켜도 지도에 마커가 표시되지 않던 버그를 수정한다.

**원인**: PostgREST v12+에서 FK=PK 1:1 관계(`participant_locations`)를 배열이 아닌 객체로 반환. 기존 코드가 배열을 가정해 `location: null`로 처리.  
**수정 내용**: `lib/api/participants.ts`에서 `Array.isArray()` 분기 추가.

---

### T-064 · 코드 복사 버그 수정 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P1
- **선행 작업**: T-023

**작업 설명**  
"코드 복사" 버튼 클릭 시 코드 대신 URL이 복사되던 버그를 수정한다.

**수정 내용**: `InviteShare.tsx`의 복사 함수를 `inviteUrl` → `inviteCode` 복사로 변경, 버튼 레이블 "링크 복사" → "코드 복사"로 수정, `appointmentId` prop 제거.

---

### T-065 · Favicon / PWA manifest / OpenGraph 메타태그 설정 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P2
- **선행 작업**: T-001

**작업 설명**  
배포 후 링크 공유 시 프리뷰와 앱 설치 경험을 개선한다.

**수정 내용**:
- `index.html`: `<link rel="icon">` (SVG favicon), `<link rel="apple-touch-icon">`, `<link rel="manifest">`, OG/Twitter 카드 메타태그 추가
- `public/manifest.json`: PWA manifest 생성 (name, icons, display: standalone)

---

### T-066 · README.md 작성 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P2
- **선행 작업**: Phase 1~10 완료

**작업 설명**  
GitHub 공개를 위한 README.md를 작성한다.

**포함 내용**: 배포 링크, 프로젝트 소개, 기존 서비스와의 차이, 주요 기능, 개발 환경(기술 스택), 프로젝트 구조, Out of Scope.

---

### T-067 · LandingPage 신규 구현 (HomePage 대체) [x]

- **난이도**: 🟡 Medium
- **우선순위**: P1
- **선행 작업**: T-019

**작업 설명**  
기존 단순 코드 입력 중심의 `HomePage`를 서비스 소개 기능이 포함된 `LandingPage`로 교체한다.

**수정 내용**:
- `src/pages/LandingPage.tsx` 신규 생성
- `src/router.tsx`의 `/` 라우트를 `HomePage` → `LandingPage`로 교체
- Hero / Problem / Features / How it works / Bottom CTA 5개 섹션 구성

---

### T-068 · LandingPage 리디자인 — 스마트폰 목업 + 스크롤 애니메이션 [x]

- **난이도**: 🔴 Hard
- **우선순위**: P2
- **선행 작업**: T-067

**작업 설명**  
참고 서비스(ittaeok.com) 스타일을 참고해 랜딩페이지를 전면 리디자인한다.

**수정 내용**:
- `PhoneFrame` 컴포넌트: CSS로 구현한 iPhone Dynamic Island 스마트폰 프레임
- `ChatScreen` / `MapScreen`: 폰 목업 내부에 표시되는 앱 화면 시뮬레이션 (실제 스크린샷 없이 HTML/CSS로 구현)
- `FadeUp` 컴포넌트: `IntersectionObserver` 기반 스크롤 진입 fade-up 애니메이션
- `animate-float` / `animate-float-slow`: CSS keyframes로 목업 부유 효과
- Sticky 하단 CTA: 스크롤 500px 후 등장, `IntersectionObserver`로 Bottom CTA 섹션 진입 시 자동 숨김

---

### T-069 · Sticky CTA 버튼 중복 표시 버그 수정 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P1
- **선행 작업**: T-068

**작업 설명**  
하단 CTA 섹션까지 스크롤 시 Sticky 버튼과 섹션 내 버튼이 겹쳐 보이던 버그를 수정한다.

**원인**: scroll 이벤트 핸들러가 `window.scrollY > 500`이면 무조건 `true`로 덮어써서 `IntersectionObserver`의 숨김 결과를 무효화.  
**수정 내용**: `bottomCtaInView` ref를 추가해 scroll 핸들러와 IntersectionObserver가 공유. scroll 핸들러는 `!bottomCtaInView.current`도 함께 체크.

---

### T-070 · manifest.json 아이콘 수정 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P2
- **선행 작업**: T-065

**작업 설명**  
`manifest.json`에 16×16 favicon 파일이 잘못 포함되어 있던 것을 수정한다.

**수정 내용**:
- `public/manifest.json`에서 `favicon-16.svg`(16px) 항목 제거
- 홈 화면 설치용 아이콘 `app-icon-192.svg`(192px)만 유지
- 기존에 존재하지 않는 파일(`latemate_app_icon.svg`, `latemate_app_icon.png`)을 참조하던 것을 실제 파일로 교체

**배경**: PWA manifest의 `icons`는 홈 화면·앱 설치용 아이콘으로 192×192 이상이 필요하다. 16×16 favicon은 브라우저 탭 전용이며 manifest에 포함하는 것은 부적절하다.

---

### T-071 · 타임라인 한국어 조사(이/가) 자동 처리 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P2
- **선행 작업**: T-045

**작업 설명**  
타임라인 이벤트 텍스트에서 사용자 이름 뒤 조사를 이름의 마지막 글자 받침 여부에 따라 자동 선택한다.

**수정 내용**:
- `src/utils/korean.ts` 신규 생성
  - `hasBatchim(str)`: 마지막 글자 받침 여부 판단 (유니코드 `0xAC00~0xD7A3` 범위, `(코드 - 0xAC00) % 28 !== 0` 공식)
  - `subjectParticle(name)`: 받침 있으면 `'이'`, 없으면 `'가'` 반환
- `src/features/timeline/Timeline.tsx`: 모든 `getText` 함수에서 `subjectParticle` 적용

**결과**: `김민준이 참여했어요` / `이지수가 출발했어요` 와 같이 올바른 조사 사용.

---

### T-072 · 주최자 초대 코드 재열람 기능 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P2
- **선행 작업**: T-023, T-030

**작업 설명**  
약속 생성 직후에만 볼 수 있던 초대 코드를 주최자가 언제든지 다시 확인하고 복사할 수 있도록 한다.

**수정 내용**:
- `AppointmentHeader.tsx`: `isHost`, `onShowInvite` prop 추가. 주최자일 때만 헤더 우측에 `Link` 아이콘 버튼 표시
- `InviteShare.tsx`: `title` prop 추가 (기본값 `'약속이 만들어졌어요! 🎉'`)
- `AppointmentPage.tsx`:
  - `inviteOpenedByHost` state 추가 — 버튼으로 연 경우와 최초 생성(`newlyCreated`)을 구분
  - 재열람 시 `InviteShare`에 `title="초대 코드 공유"` 전달

**동작**:
- 참여자(`isHost: false`): 헤더 버튼 미표시
- 주최자(`isHost: true`): 헤더에 링크 아이콘 → 탭 시 초대 코드 모달 오픈

---

### T-073 · BottomSheet 드래그 인터랙션 개선 [x]

- **난이도**: 🔴 Hard
- **우선순위**: P1
- **선행 작업**: T-011

**작업 설명**  
기존 BottomSheet의 드래그 점프, 리렌더 성능 문제, 속도 미반영 문제를 전면 재작성으로 해결한다.

**기존 문제**:
1. 드래그 시작 시 시트 위치 점프 — 스냅 위치가 Tailwind 퍼센트 클래스이고 드래그 시 인라인 `translateY(0px)`로 덮어써짐
2. `setState` 남용 — 매 `pointermove` 마다 리렌더 발생
3. 드래그 속도(플릭) 미반영 — 이동 거리 60px 기준만 사용

**수정 내용** (`src/components/ui/BottomSheet.tsx` 전면 재작성):

| 항목 | 이전 | 이후 |
|------|------|------|
| 스냅 위치 | Tailwind 퍼센트 클래스 | 컨테이너 높이 기준 픽셀값 실시간 계산 |
| 드래그 중 업데이트 | `setState` → 리렌더 | `sheetRef.current.style.transform` 직접 조작 |
| 드래그 시작 점프 | 인라인 0px로 순간이동 | `getComputedStyle` + `DOMMatrix.m42`로 현재 시각적 위치 읽어 연속 유지 |
| 진행 중 애니메이션 | 무시됨 | pointerdown 시 현재 위치에서 중단 |
| 스냅 결정 | 거리 60px 기준만 | 플릭 속도(0.4 px/ms) 감지 + 가장 가까운 스냅 흡착 |
| 경계 초과 | 없음 | 러버밴드 저항 (0.3 감쇠) |
| 초기 위치 설정 | `useEffect` (첫 프레임 후) | `useLayoutEffect` (페인트 전, 플래시 없음) |
| 이징 | `cubic-bezier(0.34,1.56,0.64,1)` bounce | `cubic-bezier(0.32, 0.72, 0, 1)` iOS 스타일 |

**핵심 구현 원리**:

```
pointerDown → getComputedStyle로 현재 시각적 Y 읽기 → transition 제거 → 그 자리에 고정
pointerMove → startSheetY + pointerDelta 계산 → 경계 초과 시 러버밴드 → style.transform 직접 적용
pointerUp   → velocity(px/ms) 기반 플릭 감지 → 목표 스냅 결정 → transition 복원 후 착지
```

---

### T-074 · BottomSheet 스크롤바 숨기기 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P2
- **선행 작업**: T-073

**작업 설명**  
웹 브라우저에서 BottomSheet 콘텐츠 영역에 스크롤바가 표시되는 문제를 수정한다.

**수정 내용**:
- `src/index.css`: `.scrollbar-hide` 유틸 클래스 추가 (`-webkit-scrollbar: none`, `scrollbar-width: none`)
- `src/components/ui/BottomSheet.tsx`: 콘텐츠 div에 `scrollbar-hide` 클래스 추가

---

### T-075 · 새로고침 시 InviteShare 모달 재등장 방지 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P1
- **선행 작업**: T-023, T-072

**작업 설명**  
약속 생성 직후 표시되는 초대 코드 모달이 페이지 새로고침 후에도 다시 나타나는 버그를 수정한다.

**원인**: React Router `location.state`는 브라우저 History API `state`에 저장되어 새로고침 후에도 유지됨.  
**수정 내용**: `AppointmentPage.tsx`에서 `isNewlyCreated === true` 시 `useEffect`로 즉시 `navigate('.', { replace: true, state: null })` 호출해 history state 초기화.

---

### T-076 · 새로고침 시 위치 공유 상태 유지 [x]

- **난이도**: 🟡 Medium
- **우선순위**: P1
- **선행 작업**: T-032, T-035

**작업 설명**  
위치 공유 중 페이지를 새로고침하면 공유 버튼이 꺼지고 GPS 추적이 중단되는 문제를 수정한다.

**원인**: `locationStore`에 persist가 없어 `isSharing`이 새로고침 시 `false`로 초기화됨. GPS `watchPosition`도 함께 끊어짐.  
**수정 내용**:
- `src/stores/locationStore.ts`: `persist` 미들웨어 추가. `isSharing`만 localStorage 저장 (`partialize`로 `watchId`·`coords` 등 런타임 값 제외)
- `src/features/location/LocationControl.tsx`: 마운트 시 `isSharing === true`이면 `startSharing()` 자동 호출로 GPS 재연결

---

### T-077 · ConfirmModal 컴포넌트 구현 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P2
- **선행 작업**: T-009

**작업 설명**  
디자인 시스템에 맞는 재사용 가능한 확인 모달 컴포넌트를 구현한다.

**수정 내용** (`src/components/ui/ConfirmModal.tsx` 신규):
- `InviteShare`와 동일한 바텀시트 스타일 (오버레이 + 흰 카드 + slide-up 애니메이션)
- 상단 핸들 바, 제목, 선택적 설명, 확인/취소 버튼 2개
- `variant: 'danger' | 'primary'`로 확인 버튼 색상 분기 (danger: 빨간색)
- 오버레이 탭 시 `onCancel` 호출 (바깥 탭으로 닫기)

---

### T-078 · 약속 페이지 메인으로 돌아가기 버튼 추가 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P2
- **선행 작업**: T-030, T-077

**작업 설명**  
약속 페이지에서 메인(랜딩) 페이지로 돌아가는 버튼을 헤더 좌측에 추가한다.

**동작**:
- 위치 공유 중 아닐 때: 즉시 `/`로 이동
- 위치 공유 중일 때: ConfirmModal 표시 → "나가기" 선택 시 `stopSharing()` + Supabase `is_sharing: false` 업데이트 후 이동 (참여자 레코드는 유지)

**수정 내용**:
- `AppointmentHeader.tsx`: `onBack` prop 추가, 좌측 `House` 아이콘 버튼 추가
- `AppointmentPage.tsx`: `handleBack`, `handleLeaveConfirm` 핸들러 구현, `showLeaveConfirm` state, `ConfirmModal` 렌더링

---

---

### T-079 · 주최자 세션 키 localStorage 미저장 버그 수정 [x]

- **난이도**: 🟢 Easy
- **우선순위**: P1
- **선행 작업**: T-030

**작업 설명**  
`useCreateAppointment`에서 `crypto.randomUUID()`로 생성한 sessionKey를 localStorage에 저장하지 않아, 주최자가 홈으로 나갔다가 초대 코드로 재진입 시 JoinPage 세션 복구가 실패하고 닉네임 입력 폼이 노출되는 버그를 수정한다.

**파생 문제**:
- 주최자가 기존 닉네임으로 재참여 시도 → "이미 사용 중인 닉네임" 에러
- 주최자가 다른 닉네임으로 재참여 → 중복 참여자 레코드 생성 + 타임라인 이벤트 중복 기록

**수정 내용** (`src/hooks/useCreateAppointment.ts`):
- `crypto.randomUUID()` 직접 사용 → `localStorage.getItem('latemate_session_key')` 기존 키 재사용 패턴으로 교체
- 키가 없을 때만 `crypto.randomUUID()`로 생성 후 localStorage에 저장

---

### T-080 · 테스트 인프라 도입 (Vitest + RTL) [x]

- **난이도**: 🟡 Medium
- **우선순위**: P1
- **선행 작업**: 없음

**작업 설명**
회귀 방지 안전망 확보를 위해 Vitest + React Testing Library 기반 테스트 인프라를 구축한다. 실제 발생 이력이 있는 버그(T-062, T-063, T-071)를 자동 검출할 수 있도록 실사용 로직 위주로 커버.

**설치 패키지** (모두 devDependencies)
- `vitest@4.1.11`
- `@vitest/coverage-v8@4.1.11`
- `@testing-library/react@16.3.3` (React 19 지원)
- `@testing-library/jest-dom@7.0.1`
- `jsdom@29.1.1`

**설정 파일**
- `vitest.config.ts`: jsdom 환경, `TZ=Asia/Seoul` 강제, `@` alias 재정의
- `src/test/setup.ts`: jest-dom matcher 등록
- `package.json` scripts: `test`, `test:watch`, `test:coverage`

**리팩토링 (기능 무변경 · 테스트 가능성 확보)**
- `src/hooks/useEta.ts`: `determineStatus`를 named export
- `src/lib/api/participants.ts`: 인라인 정규화 로직을 `normalizeParticipantRow` 함수로 승격·export
- `src/features/appointment/AppointmentHeader.tsx`: `getCountdownState`, `CountdownState` 타입 export

**테스트 파일** (8 파일, 총 48 케이스)

| 파일 | 케이스 | 검증 초점 |
|---|---|---|
| `src/utils/distance.test.ts` | 5 | Haversine 정확도, `isWithinRadius` `<=` 경계 |
| `src/utils/formatTime.test.ts` | 9 | KST 포맷, 음수 diff 처리, `Math.ceil` 경계 |
| `src/utils/korean.test.ts` | 7 | 조사(이/가) 판정, 비한글·빈문자열 crash 방지 |
| `src/hooks/useEta.test.ts` | 6 | 반경 우선순위, `LATE_BUFFER` `>` 경계 (±1ms) |
| `src/lib/api/participants.test.ts` | 4 | **T-063 회귀 방지** — PostgREST 배열/객체/null 응답 정규화 |
| `src/features/timeline/Timeline.test.tsx` | 6 | **T-071 회귀 방지** — 조사 처리, null nickname fallback, Empty 상태 |
| `src/components/ui/StatusBadge.test.tsx` | 4 | 4개 상태 텍스트 매핑 |
| `src/features/appointment/AppointmentHeader.test.tsx` | 7 | **T-062 회귀 방지** — past/countdown/future, 24h 경계, 캘린더 일자 계산 |

**검증 결과**
- `npm test`: 48/48 통과 (4.3초)
- `npm run typecheck`: 통과

**Out of Scope (Phase C에서 명시적으로 제외)**
- E2E (Playwright) — 후속 그룹에서 재검토
- 훅 통합 테스트 (`useEta`, `useGeolocation` 전체) — 모킹 비용 과다
- BottomSheet 터치 인터랙션 — pointer 이벤트 검증 복잡
- CI 파이프라인 연결 — 로컬 실행만

**기대 결과물**
- T-062/T-063/T-071 회귀가 push 전에 자동 검출됨
- 이후 그룹 2·3(백엔드 강화·아키텍처 전환) 진행 시 회귀 안전망 확보

---

_이 문서는 개발 진행에 따라 작업 완료 표시 및 신규 발견 작업을 추가하며 지속 업데이트한다._
