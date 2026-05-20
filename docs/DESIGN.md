# DESIGN.md: LateMate

> **버전**: 0.2.0  
> **작성일**: 2026-05-17  
> **목적**: 프론트엔드 아키텍처, 구현 설계 및 비주얼 디자인 테마 가이드

---

## 목차

1. [전체 프론트엔드 아키텍처](#1-전체-프론트엔드-아키텍처)
2. [폴더 구조](#2-폴더-구조)
3. [컴포넌트 계층 구조](#3-컴포넌트-계층-구조)
4. [페이지 구조](#4-페이지-구조)
5. [라우팅 설계](#5-라우팅-설계)
6. [상태 관리 설계](#6-상태-관리-설계)
7. [TanStack Query 전략](#7-tanstack-query-전략)
8. [Zustand Store 설계](#8-zustand-store-설계)
9. [API Layer 구조](#9-api-layer-구조)
10. [UI 컴포넌트 설계](#10-ui-컴포넌트-설계)
11. [반응형 레이아웃 전략](#11-반응형-레이아웃-전략)
12. [지도 인터랙션 설계](#12-지도-인터랙션-설계)
13. [실시간 Polling 흐름](#13-실시간-polling-흐름)
14. [에러 및 로딩 UX](#14-에러-및-로딩-ux)
15. [디자인 테마 및 비주얼 시스템](#15-디자인-테마-및-비주얼-시스템)
16. [TypeScript 타입 설계](#16-typescript-타입-설계)
17. [데이터 모델 설계](#17-데이터-모델-설계)
18. [Supabase 스키마 설계](#18-supabase-스키마-설계)
19. [성능 고려사항](#19-성능-고려사항)
20. [향후 확장 가능성](#20-향후-확장-가능성)

---

## 1. 전체 프론트엔드 아키텍처

### 레이어 구조

```
┌─────────────────────────────────────────────────────────────┐
│                        Pages Layer                           │
│            (Home / Create / Join / Appointment)              │
├─────────────────────────────────────────────────────────────┤
│                      Feature Layer                           │
│    (AppointmentDetail / LocationSharing / Timeline ...)      │
├───────────────────────┬─────────────────────────────────────┤
│     State Layer       │         Data Layer                   │
│  Zustand (UI State)   │  TanStack Query (Server State)       │
│  - sessionStore       │  - useAppointment                    │
│  - locationStore      │  - useParticipants                   │
│                       │  - useTimeline                       │
├───────────────────────┴─────────────────────────────────────┤
│                        API Layer                             │
│               (lib/api/appointments.ts 등)                   │
├─────────────────────────────────────────────────────────────┤
│                    External Services                         │
│          Supabase DB │ Kakao Maps SDK │ Kakao REST API       │
└─────────────────────────────────────────────────────────────┘
```

### 핵심 설계 원칙

- **Pages**: 라우팅 진입점. 데이터 페칭 훅 호출 및 Feature 컴포넌트 조합만 담당
- **Feature**: 도메인 로직을 가진 컴포넌트. UI 컴포넌트를 조합해 기능 단위로 구성
- **UI**: 순수 표현 컴포넌트. props만 받고 외부 상태 의존 없음
- **Hooks**: 위치 추적, ETA 계산 등 재사용 가능한 로직 캡슐화
- **API Layer**: Supabase 쿼리를 함수로 추상화. Query 훅과 직접 mutation 모두 이 레이어를 통해 호출

---

## 2. 폴더 구조

```
src/
│
├── pages/                          # 라우팅 진입점 (thin layer)
│   ├── LandingPage.tsx
│   ├── CreatePage.tsx
│   ├── JoinPage.tsx
│   └── AppointmentPage.tsx
│
├── features/                       # 도메인별 기능 묶음
│   ├── appointment/
│   │   ├── AppointmentHeader.tsx   # 약속 제목/시간/장소 표시
│   │   ├── CreateForm.tsx          # 약속 생성 폼
│   │   ├── InviteShare.tsx         # 초대 링크/코드 공유 UI
│   │   └── ParticipantList.tsx     # 참여자 카드 목록
│   │
│   ├── map/
│   │   ├── AppointmentMap.tsx      # 지도 루트 컴포넌트
│   │   ├── ParticipantMarker.tsx   # 개별 참여자 마커
│   │   └── DestinationMarker.tsx   # 목적지 마커
│   │
│   ├── location/
│   │   ├── LocationControl.tsx     # 위치 공유 시작/중지 버튼
│   │   └── LocationPermission.tsx  # 위치 권한 안내 화면
│   │
│   └── timeline/
│       ├── Timeline.tsx            # 타임라인 컨테이너
│       └── TimelineEvent.tsx       # 개별 이벤트 카드
│
├── components/                     # 재사용 가능한 순수 UI
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx               # 지각 상태 배지
│   │   ├── Card.tsx
│   │   ├── Avatar.tsx              # 참여자 이니셜 아바타
│   │   ├── BottomSheet.tsx         # 모바일 하단 시트
│   │   ├── Input.tsx
│   │   ├── Spinner.tsx
│   │   └── Toast.tsx
│   └── layout/
│       ├── MobileLayout.tsx        # 모바일 기본 레이아웃
│       └── SplitLayout.tsx         # 데스크탑 2열 레이아웃
│
├── hooks/                          # 재사용 로직
│   ├── useGeolocation.ts           # GPS 위치 추적
│   ├── usePolling.ts               # 범용 polling 유틸
│   ├── useEta.ts                   # ETA 계산 + 지각 판단
│   ├── useArrivalDetect.ts         # 목적지 도착 감지
│   ├── useAppointment.ts           # 약속 데이터 쿼리
│   ├── useParticipants.ts          # 참여자+위치 polling
│   └── useTimeline.ts              # 타임라인 이벤트 polling
│
├── stores/                         # Zustand 스토어
│   ├── sessionStore.ts             # 현재 사용자 세션
│   └── locationStore.ts            # 위치 공유 UI 상태
│
├── lib/                            # 외부 서비스 클라이언트
│   ├── supabase.ts                 # Supabase 클라이언트 싱글톤
│   ├── kakao.ts                    # Kakao SDK 초기화 + 타입
│   └── api/                        # API 함수 모음
│       ├── appointments.ts
│       ├── participants.ts
│       ├── locations.ts
│       ├── timeline.ts
│       └── kakaoDirections.ts
│
├── types/
│   └── index.ts                    # 공유 타입 전체 정의
│
├── constants/
│   └── index.ts                    # ARRIVAL_RADIUS, POLLING_INTERVAL 등
│
├── utils/
│   ├── formatTime.ts               # 시각 포맷 유틸
│   ├── distance.ts                 # 좌표 간 거리 계산 (Haversine)
│   └── cn.ts                       # clsx + tailwind-merge 래퍼
│
└── main.tsx
```

---

## 3. 컴포넌트 계층 구조

### AppointmentPage 기준 트리

```
AppointmentPage
├── MobileLayout (or SplitLayout on desktop)
│   │
│   ├── AppointmentHeader
│   │   ├── 약속 제목
│   │   ├── 약속 시간 카운트다운
│   │   └── 약속 장소명
│   │
│   ├── AppointmentMap              ← 지도 (화면 상단 50%)
│   │   ├── DestinationMarker       ← 목적지 핀
│   │   └── ParticipantMarker[]     ← 참여자 마커 (동적)
│   │       └── StatusBadge
│   │
│   └── BottomSheet                 ← 스와이프 가능한 하단 패널
│       ├── LocationControl         ← 위치 공유 시작/중지
│       ├── ParticipantList
│       │   └── ParticipantCard[]
│       │       ├── Avatar
│       │       ├── 닉네임 + ETA
│       │       └── StatusBadge     ← 지각/정시/도착
│       └── Timeline
│           └── TimelineEvent[]
│               ├── 이벤트 아이콘
│               ├── 닉네임
│               └── 시각
```

### 컴포넌트 역할 요약

| 컴포넌트 | 타입 | 책임 |
|---------|------|------|
| `AppointmentPage` | Page | 데이터 페칭 훅 호출, Feature 조합 |
| `AppointmentMap` | Feature | Kakao 지도 초기화, 마커 동기화 |
| `ParticipantMarker` | Feature | 개별 마커 렌더링 + 말풍선 |
| `LocationControl` | Feature | 위치 공유 ON/OFF, 권한 요청 처리 |
| `ParticipantList` | Feature | 참여자 목록 + 정렬 (도착순) |
| `Timeline` | Feature | 이벤트 목록 렌더링 |
| `BottomSheet` | UI | 모바일 하단 드래그 패널 |
| `StatusBadge` | UI | 상태별 색상/텍스트 표시 |
| `Avatar` | UI | 닉네임 이니셜 원형 아바타 |
| `Button` | UI | variant(primary/ghost/danger) 버튼 |

---

## 4. 페이지 구조

### LandingPage (`/`)

```
역할: 서비스 랜딩 페이지. 약속 만들기 CTA + 코드 입력으로 분기.

구성:
  - Hero: 로고 + 대형 타이포 + [약속 만들기] CTA + 초대 코드 입력
  - Problem: 브랜드 파란 배경 + 채팅 화면 스마트폰 목업
  - App Preview: 지도+참여자 화면 스마트폰 목업
  - Features: 핵심 기능 3개 카드 (scroll fade-up)
  - How it works: 3단계 스텝
  - Bottom CTA: 최종 약속 만들기 버튼
  - Sticky CTA: 스크롤 500px 이후 나타나는 고정 버튼 (Bottom CTA 진입 시 자동 숨김)

상태: 로컬 코드 입력값, stickyBar 노출 여부 (useState/IntersectionObserver)
데이터 페칭: fetchAppointmentByCode (코드 참여 시)
```

### CreatePage (`/create`)

```
역할: 약속 생성 폼. 제출 후 /appointment/:id 이동.

구성:
  - 약속 제목 입력
  - 장소 검색 (Kakao Local API)
  - 날짜/시간 선택
  - [약속 만들기] 제출 버튼

상태:
  - 폼 값: useState (또는 react-hook-form 선택적 도입)
  - 장소 검색 결과: useState

뮤테이션:
  - createAppointment() → Supabase insert
  - 성공 시 sessionStore에 주최자 세션 저장 + /appointment/:id 이동
```

### JoinPage (`/join/:appointmentId`)

```
역할: 초대 링크 접속 후 닉네임 입력.

구성:
  - 약속 정보 미리보기 카드 (제목, 장소, 시간)
  - 닉네임 입력 필드
  - [참여하기] 버튼

데이터 페칭:
  - useAppointment(appointmentId) → 약속 정보 표시

뮤테이션:
  - joinAppointment(appointmentId, nickname) → participants insert
  - 성공 시 sessionStore에 참여자 세션 저장 + /appointment/:id 이동
```

### AppointmentPage (`/appointment/:appointmentId`)

```
역할: 서비스 핵심 화면. 지도 + 참여자 + 타임라인.

구성:
  - AppointmentHeader (약속 정보)
  - AppointmentMap (지도)
  - BottomSheet
      - LocationControl (위치 공유 버튼)
      - ParticipantList (참여자 목록)
      - Timeline (타임라인)

데이터 페칭:
  - useAppointment()         → staleTime 30s
  - useParticipants()        → refetchInterval 7s
  - useTimeline()            → refetchInterval 10s

세션 가드:
  - sessionStore에 세션 없으면 /join/:id로 리다이렉트
```

---

## 5. 라우팅 설계

### 라우트 정의

```tsx
// src/main.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/create',
    element: <CreatePage />,
  },
  {
    path: '/join/:appointmentId',
    element: <JoinPage />,
  },
  {
    path: '/appointment/:appointmentId',
    element: <SessionGuard><AppointmentPage /></SessionGuard>,
  },
])
```

### SessionGuard 컴포넌트

```tsx
// 세션이 없으면 join 페이지로 리다이렉트
function SessionGuard({ children }: { children: React.ReactNode }) {
  const { participantId } = useSessionStore()
  const { appointmentId } = useParams()

  if (!participantId) {
    return <Navigate to={`/join/${appointmentId}`} replace />
  }
  return <>{children}</>
}
```

### 네비게이션 흐름

```
/                    약속 만들기 클릭
  └─→ /create        제출 성공
        └─→ /appointment/:id

/join/:id            닉네임 입력 완료
  └─→ /appointment/:id

/appointment/:id     세션 없음
  └─→ /join/:id (리다이렉트)
```

---

## 6. 상태 관리 설계

### 상태 분류

| 상태 종류 | 저장 위치 | 예시 |
|----------|----------|------|
| 서버 원격 상태 | TanStack Query | 약속 정보, 참여자 위치, 타임라인 |
| 전역 클라이언트 상태 | Zustand | 현재 사용자 세션, 위치 공유 여부 |
| 로컬 UI 상태 | useState | 모달 열림, 폼 입력값, BottomSheet 높이 |

### 상태 흐름 다이어그램

```
[브라우저 GPS]
      │ watchPosition
      ▼
[locationStore.currentCoords]   ← Zustand (즉각 UI 반영)
      │
      │ 7초 interval로 Supabase upsert
      ▼
[Supabase participant_locations]
      │
      │ TanStack Query polling (7초)
      ▼
[useParticipants() 캐시]        ← 모든 클라이언트가 동일하게 수신
      │
      ▼
[AppointmentMap 마커 업데이트]
[ParticipantList 카드 업데이트]
```

---

## 7. TanStack Query 전략

### QueryClient 설정

```tsx
// src/main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 10_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,   // 모바일 포커스 복귀 시 불필요한 재요청 방지
    },
  },
})
```

### Query 훅 설계

```tsx
// hooks/useAppointment.ts
export function useAppointment(appointmentId: string) {
  return useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => fetchAppointment(appointmentId),
    staleTime: 30_000,              // 약속 정보는 자주 바뀌지 않음
    enabled: !!appointmentId,
  })
}

// hooks/useParticipants.ts
export function useParticipants(appointmentId: string) {
  return useQuery({
    queryKey: ['participants', appointmentId],
    queryFn: () => fetchParticipantsWithLocations(appointmentId),
    refetchInterval: 7_000,         // 7초 polling
    refetchIntervalInBackground: false,
  })
}

// hooks/useTimeline.ts
export function useTimeline(appointmentId: string) {
  return useQuery({
    queryKey: ['timeline', appointmentId],
    queryFn: () => fetchTimeline(appointmentId),
    refetchInterval: 10_000,
  })
}
```

### Mutation 설계

```tsx
// hooks/useCreateAppointment.ts
export function useCreateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAppointment,
    onSuccess: (data) => {
      queryClient.setQueryData(['appointment', data.id], data)
    },
  })
}

// hooks/useUpdateLocation.ts
export function useUpdateLocation() {
  return useMutation({
    mutationFn: upsertParticipantLocation,
    // 위치 업데이트는 빈번하므로 캐시 무효화 없이 직접 upsert만
  })
}
```

### Query Key 컨벤션

```
['appointment', appointmentId]            → 약속 상세
['participants', appointmentId]           → 참여자 + 위치 목록
['timeline', appointmentId]               → 타임라인 이벤트
['appointment', 'list']                   → (미래) 약속 목록
```

---

## 8. Zustand Store 설계

### sessionStore

```typescript
// stores/sessionStore.ts
interface SessionState {
  participantId: string | null
  nickname: string | null
  appointmentId: string | null
  isHost: boolean

  setSession: (data: {
    participantId: string
    nickname: string
    appointmentId: string
    isHost: boolean
  }) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      participantId: null,
      nickname: null,
      appointmentId: null,
      isHost: false,

      setSession: (data) => set(data),
      clearSession: () =>
        set({ participantId: null, nickname: null, appointmentId: null, isHost: false }),
    }),
    {
      name: 'latemate-session',       // localStorage key
      partialize: (state) => ({       // 세션 데이터만 persist
        participantId: state.participantId,
        nickname: state.nickname,
        appointmentId: state.appointmentId,
        isHost: state.isHost,
      }),
    }
  )
)
```

### locationStore

```typescript
// stores/locationStore.ts
interface LocationState {
  isSharing: boolean
  currentCoords: { lat: number; lng: number } | null
  accuracy: number | null
  error: GeolocationPositionError | null
  watchId: number | null

  startSharing: () => void
  stopSharing: () => void
  setCoords: (coords: { lat: number; lng: number }, accuracy: number) => void
  setError: (error: GeolocationPositionError) => void
  setWatchId: (id: number) => void
}

export const useLocationStore = create<LocationState>()((set, get) => ({
  isSharing: false,
  currentCoords: null,
  accuracy: null,
  error: null,
  watchId: null,

  startSharing: () => set({ isSharing: true, error: null }),
  stopSharing: () => {
    const { watchId } = get()
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    set({ isSharing: false, watchId: null })
  },
  setCoords: (coords, accuracy) => set({ currentCoords: coords, accuracy }),
  setError: (error) => set({ error }),
  setWatchId: (id) => set({ watchId: id }),
}))
```

---

## 9. API Layer 구조

### 구조 원칙

- 모든 Supabase 쿼리는 `lib/api/` 내 순수 함수로 추상화
- 함수는 `async/await` + 명시적 에러 throw
- 훅에서 직접 Supabase를 호출하지 않음

### appointments.ts

```typescript
// lib/api/appointments.ts
import { supabase } from '../supabase'
import type { Appointment, CreateAppointmentInput } from '../../types'

export async function fetchAppointment(id: string): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const inviteCode = generateInviteCode()

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      ...input,
      invite_code: inviteCode,
      expires_at: new Date(new Date(input.scheduled_at).getTime() + 24 * 60 * 60 * 1000),
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function fetchAppointmentByCode(code: string): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('invite_code', code)
    .single()

  if (error) throw new Error('약속을 찾을 수 없어요')
  return data
}

function generateInviteCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
```

### locations.ts

```typescript
// lib/api/locations.ts
import { supabase } from '../supabase'
import type { ParticipantWithLocation } from '../../types'

export async function upsertParticipantLocation(
  participantId: string,
  coords: { lat: number; lng: number },
  etaSeconds: number | null,
  status: ParticipantStatus
): Promise<void> {
  const { error } = await supabase
    .from('participant_locations')
    .upsert({
      participant_id: participantId,
      lat: coords.lat,
      lng: coords.lng,
      eta_seconds: etaSeconds,
      status,
      is_sharing: true,
      updated_at: new Date().toISOString(),
    })

  if (error) throw new Error(error.message)
}

export async function fetchParticipantsWithLocations(
  appointmentId: string
): Promise<ParticipantWithLocation[]> {
  const { data, error } = await supabase
    .from('participants')
    .select(`
      *,
      participant_locations (
        lat, lng, eta_seconds, status, is_sharing, updated_at
      )
    `)
    .eq('appointment_id', appointmentId)

  if (error) throw new Error(error.message)
  return data
}
```

### kakaoDirections.ts

```typescript
// lib/api/kakaoDirections.ts
const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY

export async function fetchEtaSeconds(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<number> {
  const url = new URL('https://apis-navi.kakaomobility.com/v1/directions')
  url.searchParams.set('origin', `${origin.lng},${origin.lat}`)
  url.searchParams.set('destination', `${destination.lng},${destination.lat}`)

  const res = await fetch(url.toString(), {
    headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` },
  })

  if (!res.ok) throw new Error('ETA 계산 실패')

  const json = await res.json()
  const duration = json.routes?.[0]?.summary?.duration

  if (duration == null) throw new Error('경로 없음')
  return duration
}
```

---

## 10. UI 컴포넌트 설계

### Button

```tsx
// components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary: 'bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  ghost: 'text-gray-600 hover:bg-gray-100',
  danger: 'bg-red-500 text-white hover:bg-red-600',
}

const sizes = {
  sm: 'h-8 px-3 text-sm rounded-lg',
  md: 'h-11 px-4 text-sm rounded-xl',
  lg: 'h-14 px-6 text-base rounded-2xl',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : children}
    </button>
  )
}
```

### StatusBadge

```tsx
// components/ui/Badge.tsx
type ParticipantStatus = 'on_time' | 'late' | 'arrived' | 'unknown'

interface BadgeProps {
  status: ParticipantStatus
  etaMinutesLate?: number
}

const config: Record<ParticipantStatus, { label: string; className: string }> = {
  on_time: {
    label: '정시 예상',
    className: 'bg-emerald-100 text-emerald-700',
  },
  late: {
    label: '지각 예상',
    className: 'bg-red-100 text-red-600',
  },
  arrived: {
    label: '도착',
    className: 'bg-blue-100 text-blue-600',
  },
  unknown: {
    label: '위치 없음',
    className: 'bg-gray-100 text-gray-400',
  },
}

export default function StatusBadge({ status, etaMinutesLate }: BadgeProps) {
  const { label, className } = config[status]
  const displayLabel =
    status === 'late' && etaMinutesLate ? `지각 예상 (+${etaMinutesLate}분)` : label

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', className)}>
      {displayLabel}
    </span>
  )
}
```

### Avatar

```tsx
// components/ui/Avatar.tsx
const COLORS = [
  'bg-violet-400', 'bg-pink-400', 'bg-sky-400',
  'bg-amber-400', 'bg-emerald-400', 'bg-rose-400',
]

interface AvatarProps {
  nickname: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' }

export default function Avatar({ nickname, size = 'md' }: AvatarProps) {
  const colorIndex = nickname.charCodeAt(0) % COLORS.length
  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold text-white', COLORS[colorIndex], sizes[size])}>
      {nickname.slice(0, 1).toUpperCase()}
    </div>
  )
}
```

### BottomSheet

```tsx
// components/ui/BottomSheet.tsx
// 모바일 전용. 드래그로 높이 조절 가능한 하단 패널.
// 핸들 영역 터치 → translateY 조정
// 상태: 'collapsed' | 'half' | 'full'

interface BottomSheetProps {
  children: React.ReactNode
  defaultSnap?: 'collapsed' | 'half' | 'full'
}

// 구현: CSS transform + touch event 조합
// overscroll-behavior: contain 으로 스크롤 버블 방지
```

---

## 11. 반응형 레이아웃 전략

### 브레이크포인트 전략

```
기본 (mobile-first): < 768px
md: 768px ~  (태블릿/데스크탑)
```

### 모바일 레이아웃 (`< 768px`)

```
┌──────────────────────────┐
│  AppointmentHeader        │  h-14, fixed top
├──────────────────────────┤
│                          │
│   AppointmentMap          │  h-[50vh]
│                          │
├──────────────────────────┤  ← 드래그 핸들
│   LocationControl         │
│   ─────────────────────  │
│   ParticipantList         │  스크롤 가능
│   Timeline                │
└──────────────────────────┘
```

```tsx
// layout/MobileLayout.tsx
export default function MobileLayout({ header, map, sheet }: MobileLayoutProps) {
  return (
    <div className="relative h-dvh flex flex-col overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-20">{header}</div>
      <div className="flex-1 mt-14">{map}</div>
      <BottomSheet defaultSnap="half">{sheet}</BottomSheet>
    </div>
  )
}
```

### 데스크탑 레이아웃 (`md:`)

```
┌──────────────────────────────────────────┐
│  Header                                   │
├─────────────────┬────────────────────────┤
│  사이드바 320px  │                        │
│  ─────────────  │    지도 (나머지 영역)    │
│  LocationCtrl   │                        │
│  ParticipantList│                        │
│  Timeline       │                        │
└─────────────────┴────────────────────────┘
```

```tsx
// layout/SplitLayout.tsx
export default function SplitLayout({ sidebar, map }: SplitLayoutProps) {
  return (
    <div className="h-dvh flex flex-col">
      <header className="h-14 shrink-0">{/* header */}</header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 shrink-0 overflow-y-auto border-r border-gray-100">
          {sidebar}
        </aside>
        <main className="flex-1">{map}</main>
      </div>
    </div>
  )
}
```

### 반응형 분기 처리

```tsx
// AppointmentPage.tsx
const isMobile = useMediaQuery('(max-width: 767px)')

return isMobile
  ? <MobileLayout header={...} map={...} sheet={...} />
  : <SplitLayout sidebar={...} map={...} />
```

---

## 12. 지도 인터랙션 설계

### Kakao Maps 초기화

```tsx
// features/map/AppointmentMap.tsx
export default function AppointmentMap({ appointment, participants }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null)
  const markersRef = useRef<Map<string, kakao.maps.Marker>>(new Map())

  useEffect(() => {
    if (!mapRef.current) return

    kakao.maps.load(() => {
      const map = new kakao.maps.Map(mapRef.current!, {
        center: new kakao.maps.LatLng(appointment.place_lat, appointment.place_lng),
        level: 4,
      })
      mapInstanceRef.current = map
    })
  }, [])

  // 참여자 위치 변경 시 마커 동기화
  useEffect(() => {
    if (!mapInstanceRef.current) return
    syncParticipantMarkers(mapInstanceRef.current, markersRef.current, participants)
  }, [participants])

  return <div ref={mapRef} className="w-full h-full" />
}
```

### 마커 동기화 전략

```typescript
// 마커 추가/업데이트/제거를 Map으로 관리해 불필요한 재생성 방지
function syncParticipantMarkers(
  map: kakao.maps.Map,
  markersMap: Map<string, kakao.maps.Marker>,
  participants: ParticipantWithLocation[]
) {
  const currentIds = new Set(participants.map(p => p.id))

  // 제거된 참여자 마커 삭제
  markersMap.forEach((marker, id) => {
    if (!currentIds.has(id)) {
      marker.setMap(null)
      markersMap.delete(id)
    }
  })

  participants.forEach(p => {
    if (!p.participant_locations?.lat) return
    const pos = new kakao.maps.LatLng(p.participant_locations.lat, p.participant_locations.lng)

    if (markersMap.has(p.id)) {
      markersMap.get(p.id)!.setPosition(pos)   // 기존 마커 위치 업데이트
    } else {
      const marker = new kakao.maps.Marker({ map, position: pos })
      markersMap.set(p.id, marker)              // 신규 마커 추가
    }
  })
}
```

### 지도 자동 줌 조정

```typescript
// 모든 참여자 + 목적지가 화면에 보이도록 bounds 자동 조정
function fitMapBounds(map: kakao.maps.Map, points: { lat: number; lng: number }[]) {
  if (points.length === 0) return
  const bounds = new kakao.maps.LatLngBounds()
  points.forEach(p => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)))
  map.setBounds(bounds, 80) // 80px padding
}
```

---

## 13. 실시간 Polling 흐름

### 위치 업로드 흐름 (클라이언트 → Supabase)

```
useGeolocation 훅
  │
  │ watchPosition 콜백 (GPS 변화 시)
  ▼
locationStore.setCoords() 업데이트 (즉시 UI 반영)
  │
  │ 위치 변화량 > 10m 이거나 마지막 업로드 후 10초 경과
  ▼
useUpdateLocation mutation 호출
  │
  ▼
supabase.from('participant_locations').upsert(...)
```

```typescript
// hooks/useGeolocation.ts
export function useGeolocation() {
  const { startSharing, stopSharing, setCoords, setError, setWatchId, isSharing } = useLocationStore()
  const updateLocation = useUpdateLocation()
  const lastUploadRef = useRef<{ coords: Coords; time: number } | null>(null)

  const start = useCallback(() => {
    startSharing()

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude }
        setCoords(coords, position.coords.accuracy)

        const now = Date.now()
        const last = lastUploadRef.current

        const distanceMoved = last ? haversineDistance(last.coords, coords) : Infinity
        const timeSinceLast = last ? now - last.time : Infinity

        if (distanceMoved > 10 || timeSinceLast > 10_000) {
          updateLocation.mutate({ coords, ... })
          lastUploadRef.current = { coords, time: now }
        }
      },
      (err) => setError(err),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 3000 }
    )

    setWatchId(watchId)
  }, [])

  return { start, stop: stopSharing, isSharing }
}
```

### 위치 수신 흐름 (Supabase → 화면)

```
TanStack Query refetchInterval: 7000
  │
  ▼
fetchParticipantsWithLocations() 호출
  │
  ▼
Supabase에서 최신 위치 포함 참여자 목록 반환
  │
  ▼
useParticipants() 캐시 업데이트
  │
  ├─→ AppointmentMap: 마커 위치 업데이트
  ├─→ ParticipantList: ETA/상태 카드 업데이트
  └─→ ETA 재계산 트리거 (30초 interval)
```

### ETA 계산 주기

```typescript
// hooks/useEta.ts
export function useEta(
  participantId: string,
  currentCoords: Coords | null,
  destination: Coords,
  scheduledAt: string
) {
  const updateLocation = useUpdateLocation()

  useEffect(() => {
    if (!currentCoords) return

    const calc = async () => {
      try {
        const etaSeconds = await fetchEtaSeconds(currentCoords, destination)
        const etaTime = new Date(Date.now() + etaSeconds * 1000)
        const scheduledTime = new Date(scheduledAt)
        const BUFFER_MS = 5 * 60 * 1000

        const status: ParticipantStatus =
          isWithinRadius(currentCoords, destination, ARRIVAL_RADIUS_M)
            ? 'arrived'
            : etaTime.getTime() > scheduledTime.getTime() + BUFFER_MS
            ? 'late'
            : 'on_time'

        updateLocation.mutate({ participantId, etaSeconds, status })
      } catch {
        // ETA 실패 시 기존 상태 유지 (stale)
      }
    }

    calc()
    const interval = setInterval(calc, 30_000)
    return () => clearInterval(interval)
  }, [currentCoords?.lat, currentCoords?.lng])
}
```

---

## 14. 에러 및 로딩 UX

### 로딩 상태 처리

```tsx
// AppointmentPage.tsx
const { data: appointment, isLoading, isError } = useAppointment(appointmentId)

if (isLoading) return <FullPageSpinner />
if (isError) return <ErrorScreen message="약속 정보를 불러올 수 없어요" />
```

### 위치 권한 거부 처리

```tsx
// features/location/LocationControl.tsx
const { error, start } = useGeolocation()

if (error?.code === GeolocationPositionError.PERMISSION_DENIED) {
  return <LocationPermission />
}
```

```tsx
// features/location/LocationPermission.tsx
export default function LocationPermission() {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <MapPinSlashIcon className="w-10 h-10 text-gray-300" />
      <p className="text-sm text-gray-500">
        위치 공유 없이도 다른 참여자의 위치는 볼 수 있어요
      </p>
      <p className="text-xs text-gray-400">
        위치를 공유하려면 브라우저 설정에서 권한을 허용해주세요
      </p>
    </div>
  )
}
```

### Toast 알림

```typescript
// 에러를 Toast로 표시하는 패턴
// TanStack Query의 전역 onError 콜백 활용

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error) => {
        showToast({ message: (error as Error).message, type: 'error' })
      },
    },
  },
})
```

### 에러 유형별 UI

| 상황 | UI 패턴 | 위치 |
|------|---------|------|
| 페이지 로딩 실패 | 전체 화면 에러 + 새로고침 버튼 | 페이지 중앙 |
| 위치 업데이트 실패 | Toast (bottom) | 화면 하단 |
| 닉네임 중복 | 인라인 오류 텍스트 | Input 하단 |
| 약속 만료 | 전용 만료 화면으로 이동 | 페이지 교체 |
| 네트워크 오프라인 | 상단 배너 | Header 아래 |

---

## 15. 디자인 테마 및 비주얼 시스템

---

### 15.1 브랜드 아이덴티티

#### 디자인 방향

LateMate는 **"약속에 늦을 것 같아 불안한 순간"** 을 다루는 서비스다. UI는 그 긴장감을 조장하지 않고, 오히려 상황을 투명하게 보여줌으로써 **안심감** 을 제공해야 한다.

> "지금 어디야?" 대신 "보면 알잖아."

#### 디자인 키워드

| 키워드 | 의미 |
|--------|------|
| **Live** | 지금 이 순간을 보여주는 실시간성 |
| **Calm** | 지각 상황에서도 패닉 없이 현황 파악 |
| **Honest** | 지각 예상을 숨기지 않고 솔직하게 표시 |
| **Compact** | 모바일에서 한 화면에 핵심 정보 압축 |

#### 비주얼 원칙

1. **정보 우선**: 장식보다 상태 정보가 먼저 눈에 들어와야 한다
2. **여백으로 호흡**: 빽빽한 정보도 여백을 통해 읽기 편하게
3. **색은 의미를 위해**: 장식용 컬러 사용 금지. 모든 색은 상태를 전달
4. **터치 친화**: 모든 인터랙티브 요소는 44px 이상

---

### 15.2 컬러 시스템

#### 브랜드 컬러 — Slate Indigo

기존 인디고 계열을 유지하되, 채도를 한 단계 낮춰 **실용적이고 차분한 느낌** 을 준다.

```
Primary       #4F46E5   (indigo-600)  메인 CTA, 강조 요소
Primary Light #EEF2FF   (indigo-50)   배경 강조, 선택 상태
Primary Mid   #C7D2FE   (indigo-200)  비활성 강조, 구분선
Primary Dark  #3730A3   (indigo-800)  헤더, 중요 텍스트 강조
```

#### 상태 컬러

```
On Time  ●  #10B981   (emerald-500)  정시 도착 예상
Late     ●  #EF4444   (red-500)      지각 예상 (주요 경고색)
Arrived  ●  #3B82F6   (blue-500)     도착 완료
Unknown  ●  #9CA3AF   (gray-400)     위치 없음 / 미공유
```

#### 중립 컬러 — Cool Gray

```
Gray 900    #111827   본문 주요 텍스트
Gray 700    #374151   부제목, 강조 본문
Gray 500    #6B7280   보조 텍스트, 설명
Gray 400    #9CA3AF   플레이스홀더, 비활성
Gray 200    #E5E7EB   구분선, 테두리
Gray 100    #F3F4F6   카드 호버 배경
Gray 50     #F9FAFB   페이지 배경
```

#### 서피스 컬러

```
Background  #F7F8FC   (약간의 cool tone이 섞인 오프화이트)
Surface     #FFFFFF   카드, 시트, 모달
Overlay     rgba(0,0,0,0.4)   BottomSheet 뒤 딤 처리
```

#### 컬러 사용 규칙

| 요소 | 컬러 |
|------|------|
| 페이지 배경 | `#F7F8FC` |
| 카드/시트 배경 | `#FFFFFF` |
| 기본 버튼 | `#4F46E5` |
| 위험/지각 | `#EF4444` |
| 성공/정시 | `#10B981` |
| 도착 | `#3B82F6` |
| 텍스트 (주) | `#111827` |
| 텍스트 (보조) | `#6B7280` |
| 구분선 | `#E5E7EB` |

---

### 15.3 타이포그래피

#### 폰트 패밀리

**Pretendard** — 한국어에 최적화된 고질량 폰트. Apple San Francisco/Helvetica 계열의 가독성을 한국어에서 재현.

```html
<!-- index.html -->
<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css" />
```

```css
/* index.css */
* { font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif; }
```

#### 타입 스케일

| 레벨 | 크기 | 두께 | 줄간격 | 용도 |
|------|------|------|--------|------|
| Display | 24px / `text-2xl` | 700 | 1.2 | 홈 페이지 타이틀 |
| Heading 1 | 20px / `text-xl` | 700 | 1.3 | 페이지 제목, 약속명 |
| Heading 2 | 16px / `text-base` | 600 | 1.4 | 섹션 제목 |
| Body | 14px / `text-sm` | 400 | 1.6 | 일반 본문 |
| Body Strong | 14px / `text-sm` | 600 | 1.6 | 강조 본문, 닉네임 |
| Caption | 12px / `text-xs` | 400 | 1.5 | 보조 정보, 시각 |
| Caption Strong | 12px / `text-xs` | 500 | 1.5 | 배지, 라벨 |
| Mono | 13px / `text-[13px]` | 500 | — | 초대 코드, ETA 숫자 |

#### 숫자 표시

ETA, 카운트다운, 초대 코드 등 숫자는 **tabular-nums** 적용으로 자릿수 변화 시 흔들림 방지.

```
className="font-mono tabular-nums"
```

---

### 15.4 간격 & 사이징 시스템

**8px 기준 그리드** 로 모든 간격을 결정한다.

```
4px  (spacing-1)  아이콘 내부 소간격
8px  (spacing-2)  인라인 요소 간격
12px (spacing-3)  카드 내부 소항목 간격
16px (spacing-4)  카드 패딩, 기본 여백
20px (spacing-5)  섹션 내부 간격
24px (spacing-6)  섹션 간 간격
32px (spacing-8)  페이지 상단 여백
```

#### 터치 영역

```
최소 터치 영역:  44 × 44px
CTA 버튼 높이:   52px (h-13)
보조 버튼 높이:  44px (h-11)
소형 버튼 높이:  36px (h-9)
아이콘 버튼:     44 × 44px (패딩으로 확장)
```

---

### 15.5 모서리 반경 & 그림자

#### Border Radius

```
4px   rounded      인라인 배지, 태그
8px   rounded-lg   소형 버튼, 입력 필드
12px  rounded-xl   카드, 중형 버튼
16px  rounded-2xl  BottomSheet, 대형 카드
24px  rounded-3xl  홈 CTA 버튼, 전면 모달
9999px rounded-full  아바타, 상태 배지, 토스트
```

#### Shadow (Elevation)

```
shadow-none      배경과 동일 레벨 (구분선으로만 분리)
shadow-sm        기본 카드   box-shadow: 0 1px 3px rgba(0,0,0,0.06)
shadow-md        플로팅 버튼  box-shadow: 0 4px 12px rgba(0,0,0,0.10)
shadow-lg        BottomSheet box-shadow: 0 -4px 24px rgba(0,0,0,0.08)
shadow-xl        모달        box-shadow: 0 8px 32px rgba(0,0,0,0.14)
```

---

### 15.6 아이콘 시스템

**Lucide React** 사용. 일관된 stroke-width와 크기를 유지.

```bash
npm install lucide-react
```

#### 크기 규칙

```
16px (size-4)   인라인 아이콘 (텍스트 옆)
20px (size-5)   카드 내 아이콘, 배지 앞
24px (size-6)   버튼 아이콘, 메뉴 아이콘
32px (size-8)   빈 상태 일러스트 대용
40px (size-10)  에러 화면, 안내 화면
```

#### stroke-width

```
모든 아이콘: strokeWidth={1.5}   (Lucide 기본값 2보다 가볍게)
```

#### 주요 사용 아이콘

| 아이콘 | 용도 |
|--------|------|
| `MapPin` | 약속 장소 |
| `Clock` | 약속 시간, ETA |
| `Navigation` | 위치 공유 중 |
| `NavigationOff` | 위치 공유 안 함 |
| `Users` | 참여자 목록 |
| `CheckCircle2` | 도착 완료 |
| `AlertCircle` | 지각 예상 경고 |
| `Copy` | 초대 코드 복사 |
| `Share2` | 공유 버튼 |
| `ChevronUp` | BottomSheet 핸들 |

---

### 15.7 애니메이션 & 모션 원칙

#### 기본 원칙

- 애니메이션은 **상태 전환에만** 사용. 장식 목적 금지.
- 지속 시간: `150ms` (즉각 반응) ~ `300ms` (상태 전환)
- 이징: `ease-out` 기본. 들어오는 요소는 빠르게 → 느리게.

#### Tailwind transition 설정

```javascript
// tailwind.config.ts
transitionTimingFunction: {
  'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',  // 스프링감
},
transitionDuration: {
  '150': '150ms',
  '250': '250ms',
  '350': '350ms',
},
```

#### 주요 애니메이션 정의

**① Live Pulse — 위치 공유 중 표시**

```css
/* 위치 공유 중인 사용자 마커, LocationControl 버튼에 적용 */
@keyframes live-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(1.15); }
}
.animate-live-pulse {
  animation: live-pulse 2s ease-in-out infinite;
}
```

```tsx
// 사용 예: 위치 공유 중 인디케이터 점
<span className="block w-2 h-2 rounded-full bg-emerald-500 animate-live-pulse" />
```

**② Ripple — 마커 위치 갱신 시**

```css
@keyframes ripple {
  0%   { transform: scale(1);   opacity: 0.6; }
  100% { transform: scale(2.5); opacity: 0; }
}
.animate-ripple {
  animation: ripple 1.2s ease-out forwards;
}
```

**③ Status Change — 배지 상태 전환**

```css
/* 정시 → 지각 전환 시 배지에 shake 효과 */
@keyframes shake-once {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-3px); }
  60%       { transform: translateX(3px); }
}
.animate-shake-once { animation: shake-once 0.4s ease-out; }
```

**④ Slide Up — BottomSheet 진입**

```css
@keyframes slide-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
.animate-slide-up {
  animation: slide-up 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

**⑤ Skeleton — 로딩 플레이스홀더**

```css
/* Tailwind의 animate-pulse 활용 */
.skeleton {
  @apply bg-gray-200 rounded-lg animate-pulse;
}
```

**⑥ Float — 랜딩페이지 스마트폰 목업 부유 효과**

```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-12px); }
}
.animate-float      { animation: float 3s ease-in-out infinite; }
.animate-float-slow { animation: float 4.5s ease-in-out infinite; }
```

**⑦ Fade Up — 랜딩페이지 스크롤 진입 애니메이션**

```tsx
// IntersectionObserver로 뷰포트 진입 감지 후 opacity + translateY 전환
// 각 섹션 콘텐츠가 스크롤로 뷰에 들어올 때 아래→위로 자연스럽게 등장
// FadeUp 컴포넌트: delay prop으로 stagger 구현 (feature 카드: 100ms 간격)
style={{
  opacity: inView ? 1 : 0,
  transform: inView ? 'translateY(0)' : 'translateY(32px)',
  transition: `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`,
}}
```

#### 컴포넌트별 트랜지션

| 컴포넌트 | 트랜지션 |
|---------|---------|
| Button hover/active | `transition-colors duration-150` |
| StatusBadge 상태 변경 | `transition-all duration-300` |
| BottomSheet 드래그 | `transition-transform duration-250 ease-spring` |
| 마커 위치 이동 | Kakao Maps 내 `setPosition()` — CSS transition 별도 적용 불가 |
| ParticipantCard 진입 | `animate-slide-up` (리스트에 새 항목 추가 시) |
| 토스트 | fade-in `opacity-0 → opacity-100 duration-200` |

---

### 15.8 페이지별 UI 명세

#### LandingPage (`/`)

```
┌──────────────────────────────┐
│  LM  LateMate                │  bg: white, 로고 + 브랜드명
│                              │
│  지각하지                    │  text-[52px] font-black text-gray-900
│  말자,                       │
│  함께 (brand-600)            │  핵심 키워드에 브랜드 컬러 강조
│                              │
│  실시간 위치 공유로 ...       │  text-[15px] text-gray-500
│                              │
│  ┌──────────────────────┐   │
│  │  약속 만들기  →       │   │  h-14, rounded-2xl, bg-brand-600
│  └──────────────────────┘   │
│  ── 또는 코드로 참여 ──      │
│  ┌──────────────┐ ┌──────┐  │
│  │ 초대 코드 6자리│ │참여  │  │
│  └──────────────┘ └──────┘  │
│         [SCROLL ↓]           │  마우스 아이콘 + bounce 힌트
├──────────────────────────────┤
│  (brand-600 bg)              │  Problem 섹션
│  "지금 어디야?" ...           │
│      📱 채팅 스마트폰 목업    │  float 애니메이션
├──────────────────────────────┤
│  (white bg)                  │  App Preview 섹션
│  실시간 지도로 한눈에         │
│      📱 지도 스마트폰 목업    │  float-slow 애니메이션
├──────────────────────────────┤
│  (gray-50 bg) 핵심 기능      │  Features 섹션, stagger fade-up
│  ┌──────┐ ┌──────┐ ┌──────┐│
│  │위치공유│ │ETA  │ │지각알림│  3개 카드
│  └──────┘ └──────┘ └──────┘│
├──────────────────────────────┤
│  3단계로 끝                   │  How it works 섹션
│  01 → 02 → 03               │  그라데이션 연결선
├──────────────────────────────┤
│  (brand gradient bg)         │  Bottom CTA 섹션
│  30초면 충분해요              │
│  ┌──────────────────────┐   │
│  │  약속 만들기  →       │   │
│  └──────────────────────┘   │
└──────────────────────────────┘
[fixed bottom] 약속 만들기 →    스크롤 500px 후 등장, Bottom CTA 진입 시 숨김
│   ┌──────────────────────┐   │
│   │  참여하기             │   │  Secondary 버튼 h-12
│   └──────────────────────┘   │  bg-gray-100 text-gray-900
│                              │
└──────────────────────────────┘
```

**디자인 포인트**
- 상단 여백 `pt-20` — 콘텐츠를 시각적 중심보다 살짝 위로
- 로고 아이콘: `MapPin` 아이콘을 indigo로 채운 SVG
- 코드 입력창: `tracking-[0.3em]` 으로 자릿수 구분 강조

---

#### CreatePage (`/create`)

```
┌──────────────────────────────┐
│  ←  새 약속 만들기            │  Header h-14, bg-white, shadow-sm
├──────────────────────────────┤
│                              │  bg-gray-50
│  ┌──────────────────────┐   │
│  │ 약속 이름              │   │  섹션 라벨 text-xs text-gray-500 uppercase
│  │ ┌────────────────┐   │   │
│  │ │ 예: 강남역 치킨  │   │   │  Input rounded-xl h-12
│  │ └────────────────┘   │   │
│  └──────────────────────┘   │
│                              │
│  ┌──────────────────────┐   │
│  │ 약속 장소              │   │
│  │ ┌────────────────┐   │   │
│  │ │ 🔍 장소 검색    │   │   │  검색 Input (Kakao)
│  │ └────────────────┘   │   │
│  │  ┌──────────────┐    │   │  검색 결과 드롭다운
│  │  │ 강남역 2번출구 │    │   │  bg-white rounded-xl shadow-md
│  │  │ 강남구청      │    │   │
│  │  └──────────────┘    │   │
│  └──────────────────────┘   │
│                              │
│  ┌──────────────────────┐   │
│  │ 약속 날짜 & 시간       │   │
│  │ ┌────────────────┐   │   │
│  │ │ 2026. 05. 17   │   │   │  날짜 입력 (네이티브 date picker)
│  │ └────────────────┘   │   │
│  │ ┌────────────────┐   │   │
│  │ │ 오후 7:00      │   │   │  시간 입력 (네이티브 time picker)
│  │ └────────────────┘   │   │
│  └──────────────────────┘   │
│                              │
├──────────────────────────────┤  fixed bottom, bg-white, pt-4 pb-safe
│  ┌──────────────────────┐   │
│  │  약속 만들기 →        │   │  Primary CTA, h-14, full width
│  └──────────────────────┘   │
└──────────────────────────────┘
```

**디자인 포인트**
- 각 폼 필드는 `Card` 컴포넌트로 묶어 구분감 부여
- 선택된 장소: `MapPin` 아이콘 + 장소명 인라인 표시, 배경 `indigo-50`
- CTA는 하단 고정 (`fixed bottom-0`) + iOS Safe Area 대응

---

#### JoinPage (`/join/:id`)

```
┌──────────────────────────────┐
│                              │  bg-gray-50
│  ┌──────────────────────┐   │
│  │  약속 정보 카드        │   │  bg-white rounded-2xl shadow-sm p-5
│  │                      │   │
│  │  강남역 치킨           │   │  text-xl font-bold
│  │                      │   │
│  │  📍 강남역 2번출구     │   │  text-sm text-gray-500
│  │  🕖 오늘 오후 7:00    │   │  text-sm text-gray-500
│  │                      │   │
│  │  참여자 3명            │   │  text-xs text-indigo-600 bg-indigo-50
│  │  ● 철수 ● 영희 ● 민준 │   │  아바타 그룹 (겹치기 표시)
│  └──────────────────────┘   │
│                              │
│  ┌──────────────────────┐   │
│  │ 내 닉네임              │   │
│  │ ┌────────────────┐   │   │
│  │ │ 최대 10자       │   │   │  Input h-12, autofocus
│  │ └────────────────┘   │   │
│  │  * 약속 안에서만 사용  │   │  text-xs text-gray-400
│  └──────────────────────┘   │
│                              │
├──────────────────────────────┤
│  ┌──────────────────────┐   │
│  │  참여하기             │   │  Primary CTA
│  └──────────────────────┘   │
└──────────────────────────────┘
```

**디자인 포인트**
- 약속 카드 상단에 얇은 `indigo-600` 컬러 스트라이프 (4px 높이) — 브랜드 강조
- 참여자 아바타 그룹: 겹치기 스택 (`-ml-2` 간격)
- 닉네임 입력 후 엔터키로 제출 가능

---

#### AppointmentPage (`/appointment/:id`) — 모바일

```
┌──────────────────────────────┐
│  ← 강남역 치킨    D-00:45:30  │  Header h-14 bg-white shadow-sm
│    📍 강남역 2번출구           │  카운트다운: text-indigo-600 font-mono
├──────────────────────────────┤
│                              │
│         카카오 지도            │  h-[50vh] (BottomSheet half 상태 기준)
│                              │
│  [목적지 마커 — 강조 핀 🏁]    │
│  [철수 마커 🔵] [영희 마커 🔴]  │  참여자별 커스텀 HTML 마커
│                              │
└──────────┬───────────────────┘
           │ ← BottomSheet 드래그 핸들 (회색 바)
┌──────────▼───────────────────┐  bg-white rounded-t-3xl shadow-lg
│  ━━━━━━━━━━━━               │  핸들 바: w-10 h-1 bg-gray-300 mx-auto mt-3
│                              │
│  ┌──────────────────────┐   │  LocationControl 영역
│  │  📡 위치 공유 시작    │   │  활성 전: indigo 배경 버튼
│  │  (또는 공유 중...)    │   │  활성 중: emerald 배경 + pulse 애니메이션
│  └──────────────────────┘   │
│                              │
│  참여자  (3)                  │  섹션 헤더
│  ┌──────────────────────┐   │
│  │ 🟢  철수  정시 예상   │   │  ParticipantCard
│  │         12분 후 도착  │   │  ETA 텍스트 text-xs text-gray-400
│  ├──────────────────────┤   │
│  │ 🔴  영희  지각 예상+8 │   │  상태 배지 bg-red-100 text-red-600
│  │         20분 후 도착  │   │
│  ├──────────────────────┤   │
│  │ ⚪  민준  위치 없음   │   │  회색 처리
│  └──────────────────────┘   │
│                              │
│  타임라인                     │  섹션 헤더
│  │ 🕖 18:52  영희 출발했어요  │  TimelineEvent
│  │ 🕖 18:50  철수 출발했어요  │
│  │ 🕖 18:45  민준 참여했어요  │
│                              │
└──────────────────────────────┘
```

---

### 15.9 컴포넌트 비주얼 명세

#### LocationControl 버튼 — 상태별

```
[미공유 상태]
┌────────────────────────────────┐
│  🗺  위치 공유 시작하기  →      │  bg-indigo-600, text-white, h-14
└────────────────────────────────┘

[공유 중 상태]
┌────────────────────────────────┐
│  ● 위치 공유 중  ·  중지하기   │  bg-emerald-50, border border-emerald-300
└────────────────────────────────┘  텍스트: text-emerald-700
   ↑ 녹색 점 animate-live-pulse

[권한 거부 상태]
┌────────────────────────────────┐
│  ⚠  위치 권한이 필요해요       │  bg-amber-50, border border-amber-200
└────────────────────────────────┘  텍스트: text-amber-700
```

#### ParticipantCard — 상태별 비주얼

```
[정시 예상]                          [지각 예상]
┌─────────────────────┐             ┌─────────────────────┐
│ 🟢  철수             │             │ 🔴  영희             │
│     정시 예상        │  ←Badge     │     지각 예상 +8분   │  ← bg-red-100
│     12분 후 도착     │             │     20분 후 도착     │
└─────────────────────┘             └─────────────────────┘
  border-l-2 border-emerald-400       border-l-2 border-red-400

[도착 완료]                          [위치 없음]
┌─────────────────────┐             ┌─────────────────────┐
│ ✅  민준             │             │ ⚪  지수             │
│     도착            │             │     위치 없음         │
│     강남역 2번출구   │             │     위치 공유 안 함   │
└─────────────────────┘             └─────────────────────┘
  border-l-2 border-blue-400          opacity-60, 리스트 최하단 정렬
```

**카드 좌측 컬러 바**: `border-l-2` 로 상태 색상을 선으로 표현 — 배지와 이중 표시

#### 지도 마커 — 커스텀 HTML 마커

Kakao Maps 기본 마커 대신 `CustomOverlay` 로 HTML 마커 사용.

```tsx
// 참여자 마커 HTML 구조
function createMarkerContent(nickname: string, status: ParticipantStatus): HTMLElement {
  const el = document.createElement('div')
  el.className = 'relative flex flex-col items-center'
  el.innerHTML = `
    <div class="
      relative flex items-center justify-center
      w-10 h-10 rounded-full border-2 border-white shadow-md
      text-white text-xs font-bold
      ${STATUS_MARKER_COLOR[status]}
    ">
      ${nickname.slice(0, 1).toUpperCase()}
      ${status === 'on_time' ? `
        <span class="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border border-white animate-live-pulse" />
      ` : ''}
    </div>
    <div class="
      mt-1 px-1.5 py-0.5 bg-white rounded-full shadow-sm
      text-[10px] font-medium text-gray-700 whitespace-nowrap
    ">${nickname}</div>
    <div class="w-0.5 h-2 bg-gray-300"></div>
  `
  return el
}

const STATUS_MARKER_COLOR: Record<ParticipantStatus, string> = {
  on_time: 'bg-emerald-500',
  late:    'bg-red-500',
  arrived: 'bg-blue-500',
  unknown: 'bg-gray-400',
}
```

```tsx
// 목적지 마커
const DESTINATION_MARKER_HTML = `
  <div class="flex flex-col items-center">
    <div class="w-12 h-12 rounded-full bg-indigo-600 border-4 border-white shadow-lg
                flex items-center justify-center text-white text-xl">
      🏁
    </div>
    <div class="mt-1 px-2 py-0.5 bg-indigo-600 rounded-full text-white text-[10px] font-medium whitespace-nowrap shadow">
      목적지
    </div>
    <div class="w-0.5 h-3 bg-indigo-400"></div>
  </div>
`
```

#### StatusBadge — 아이콘 포함 버전

```tsx
const BADGE_CONFIG = {
  on_time: {
    icon: CheckCircle2,
    label: '정시 예상',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  late: {
    icon: AlertCircle,
    label: '지각 예상',
    className: 'bg-red-50 text-red-600 border border-red-200',
  },
  arrived: {
    icon: CheckCircle2,
    label: '도착',
    className: 'bg-blue-50 text-blue-600 border border-blue-200',
  },
  unknown: {
    icon: MapPinOff,
    label: '위치 없음',
    className: 'bg-gray-100 text-gray-400 border border-gray-200',
  },
}

// 렌더링
<span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', config.className)}>
  <Icon className="w-3 h-3" strokeWidth={2} />
  {displayLabel}
</span>
```

#### 초대 코드 공유 UI

```
약속 생성 완료 → 모달 or 별도 섹션

┌──────────────────────────────────────┐
│  약속이 만들어졌어요! 🎉              │  text-lg font-bold
│                                      │
│  ┌──────────────────────────────┐   │
│  │        초대 코드               │   │  text-xs text-gray-400
│  │   ┌──────────────────────┐   │   │
│  │   │   4  8  2  9  1  3   │   │   │  font-mono text-3xl font-bold
│  │   │                      │   │   │  letter-spacing: 0.4em
│  │   └──────────────────────┘   │   │  bg-indigo-50 rounded-xl p-4
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────┐ ┌──────────────┐  │
│  │ 📋 코드 복사  │ │ 💬 카톡 공유  │  │  버튼 2개 나란히
│  └──────────────┘ └──────────────┘  │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  약속 화면으로 →              │   │  ghost 버튼
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

#### 타임라인 이벤트

```
│  ●────────────────────────────────
│  │  🏃 철수가 출발했어요           text-sm font-medium
│  │     오후 6:52                  text-xs text-gray-400
│  │
│  ●────────────────────────────────
│  │  🔴 영희가 지각 예상이에요       text-sm font-medium, text-red-600
│  │     도착 예상 오후 7:08         text-xs text-red-400
│  │
│  ●────────────────────────────────
│  │  👋 민준이 참여했어요           text-sm font-medium
│  │     오후 6:45                  text-xs text-gray-400
```

- 세로선: `border-l-2 border-gray-100 ml-2`
- 이벤트 점: `w-3 h-3 rounded-full` + 이벤트 타입별 색상
- 지각 이벤트: 텍스트 `text-red-600`, 점 `bg-red-400`

---

### 15.10 마이크로인터랙션

#### 초대 코드 복사

```
1. 사용자가 "코드 복사" 클릭
2. 버튼 텍스트: "📋 코드 복사" → "✅ 복사됐어요!"
3. 버튼 색상: gray-100 → emerald-50 (transition 150ms)
4. 2초 후 원래 상태 복원
```

```tsx
const [copied, setCopied] = useState(false)

const handleCopy = async () => {
  await navigator.clipboard.writeText(inviteCode)  // URL이 아닌 6자리 코드 복사
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}
```

#### 위치 공유 시작

```
1. 사용자가 "위치 공유 시작" 클릭
2. 버튼 → 로딩 스피너 (GPS 권한 요청 중)
3. 권한 허용 → 버튼 emerald로 전환 + pulse 시작
4. 지도에 내 마커 즉시 표시
5. BottomSheet에서 내 카드 상태 → "공유 중" 배지 등장
```

#### 지각 예상 전환

```
1. ETA 재계산 후 status가 on_time → late 전환
2. StatusBadge: emerald → red, shake-once 애니메이션
3. ParticipantCard: 좌측 border emerald → red
4. 지도 마커: 색상 emerald → red (CustomOverlay 재생성)
```

#### BottomSheet 드래그

```
snap points: [72px | 50vh | 90vh]
  │
  ├─ collapsed (72px): LocationControl 버튼만 노출
  ├─ half (50vh):      참여자 목록 상단까지 노출 (기본)
  └─ full (90vh):      전체 목록 + 타임라인

드래그 중: map 영역에 dim overlay 없음 (투명)
스냅 시:   spring 이징으로 착지감
```

#### 참여자 신규 입장

```
1. polling으로 새 참여자 감지
2. ParticipantCard 리스트 상단에서 slide-down 진입
3. 타임라인에 "○○이 참여했어요" 이벤트 추가 (slide-up)
```

---

### 15.11 Tailwind Config 완성본

```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', '-apple-system', 'sans-serif'],
        mono: ['Pretendard Variable', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
        },
        status: {
          'on-time': '#10B981',
          late:      '#EF4444',
          arrived:   '#3B82F6',
          unknown:   '#9CA3AF',
        },
        surface: {
          page:  '#F7F8FC',
          card:  '#FFFFFF',
        },
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        float: '0 4px 12px rgba(0,0,0,0.10)',
        sheet: '0 -4px 24px rgba(0,0,0,0.08)',
      },
      keyframes: {
        'live-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':       { opacity: '0.4', transform: 'scale(1.15)' },
        },
        'ripple': {
          '0%':   { transform: 'scale(1)',   opacity: '0.6' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'shake-once': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':       { transform: 'translateX(-3px)' },
          '60%':       { transform: 'translateX(3px)' },
        },
        'slide-up': {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
      },
      animation: {
        'live-pulse': 'live-pulse 2s ease-in-out infinite',
        'ripple':     'ripple 1.2s ease-out forwards',
        'shake-once': 'shake-once 0.4s ease-out',
        'slide-up':   'slide-up 0.25s ease-out',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config
```

#### 공통 유틸 함수

```typescript
// utils/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 16. TypeScript 타입 설계

```typescript
// types/index.ts

// ─── 도메인 모델 ───────────────────────────────────────────

export interface Appointment {
  id: string
  title: string
  place_name: string
  place_lat: number
  place_lng: number
  scheduled_at: string          // ISO 8601
  invite_code: string
  created_at: string
  expires_at: string
}

export interface Participant {
  id: string
  appointment_id: string
  nickname: string
  session_key: string
  is_host: boolean
  joined_at: string
}

export interface ParticipantLocation {
  participant_id: string
  lat: number | null
  lng: number | null
  is_sharing: boolean
  eta_seconds: number | null
  status: ParticipantStatus
  updated_at: string
}

export interface ParticipantWithLocation extends Participant {
  participant_locations: ParticipantLocation | null
}

export interface TimelineEvent {
  id: string
  appointment_id: string
  participant_id: string
  event_type: TimelineEventType
  occurred_at: string
  participant?: Pick<Participant, 'nickname'>
}

// ─── Enum-like 상수 ────────────────────────────────────────

export type ParticipantStatus = 'on_time' | 'late' | 'arrived' | 'unknown'

export type TimelineEventType = 'JOINED' | 'DEPARTED' | 'ARRIVED' | 'LATE_ALERT'

// ─── 입력 타입 ─────────────────────────────────────────────

export interface CreateAppointmentInput {
  title: string
  place_name: string
  place_lat: number
  place_lng: number
  scheduled_at: string
}

export interface JoinAppointmentInput {
  appointment_id: string
  nickname: string
  session_key: string
}

// ─── 공통 유틸 타입 ────────────────────────────────────────

export interface Coords {
  lat: number
  lng: number
}

export interface SessionData {
  participantId: string
  nickname: string
  appointmentId: string
  isHost: boolean
}
```

---

## 17. 데이터 모델 설계

### 관계 다이어그램

```
appointments
  │ 1
  │
  │ N
participants ──────────── participant_locations (1:1, upsert)
  │
  │ 1
  │
  │ N
timeline_events
```

### 핵심 데이터 흐름

```
약속 생성
  → appointments 1개 insert
  → participants 1개 insert (is_host: true)

참여자 입장
  → participants 1개 insert

위치 공유 시작
  → participant_locations upsert (participant_id PK 기준)
  → timeline_events insert (DEPARTED)

도착 감지
  → participant_locations update (status: 'arrived')
  → timeline_events insert (ARRIVED)
```

---

## 18. Supabase 스키마 설계

### DDL

```sql
-- 약속
create table appointments (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(title) <= 50),
  place_name   text not null,
  place_lat    float8 not null,
  place_lng    float8 not null,
  scheduled_at timestamptz not null,
  invite_code  char(6) unique not null,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null
);

create index on appointments (invite_code);
create index on appointments (expires_at);  -- 만료 쿼리 최적화

-- 참여자
create table participants (
  id             uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  nickname       text not null check (char_length(nickname) between 1 and 10),
  session_key    text not null,
  is_host        boolean not null default false,
  joined_at      timestamptz not null default now(),
  unique (appointment_id, nickname)
);

create index on participants (appointment_id);
create index on participants (session_key);  -- 세션 복구 조회

-- 최신 위치 (참여자당 1레코드)
create table participant_locations (
  participant_id uuid primary key references participants(id) on delete cascade,
  lat            float8,
  lng            float8,
  is_sharing     boolean not null default false,
  eta_seconds    integer,
  status         text not null default 'unknown'
                 check (status in ('on_time', 'late', 'arrived', 'unknown')),
  updated_at     timestamptz not null default now()
);

-- 타임라인 이벤트
create table timeline_events (
  id             uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  event_type     text not null
                 check (event_type in ('JOINED', 'DEPARTED', 'ARRIVED', 'LATE_ALERT')),
  occurred_at    timestamptz not null default now()
);

create index on timeline_events (appointment_id, occurred_at desc);
```

### RLS 정책

```sql
-- appointments: 공개 읽기 (링크 공유 특성)
alter table appointments enable row level security;
create policy "appointments_select" on appointments for select using (true);
create policy "appointments_insert" on appointments for insert with check (true);

-- participants: 같은 약속 참여자만 조회
alter table participants enable row level security;
create policy "participants_select" on participants for select
  using (appointment_id in (
    select appointment_id from participants where session_key = current_setting('request.jwt.claims', true)::json->>'session_key'
  ));
create policy "participants_insert" on participants for insert with check (true);

-- participant_locations: 같은 약속 참여자만 조회
alter table participant_locations enable row level security;
create policy "locations_select" on participant_locations for select
  using (participant_id in (
    select p.id from participants p
    where p.appointment_id in (
      select appointment_id from participants
      where session_key = current_setting('request.jwt.claims', true)::json->>'session_key'
    )
  ));
create policy "locations_upsert" on participant_locations for all using (true);

-- timeline_events: 같은 약속 참여자만 조회
alter table timeline_events enable row level security;
create policy "timeline_select" on timeline_events for select
  using (appointment_id in (
    select appointment_id from participants
    where session_key = current_setting('request.jwt.claims', true)::json->>'session_key'
  ));
create policy "timeline_insert" on timeline_events for insert with check (true);
```

### Supabase 환경 변수

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_KAKAO_MAP_KEY=kakao_js_app_key
VITE_KAKAO_REST_API_KEY=kakao_rest_api_key
```

---

## 19. 성능 고려사항

### 지도 성능

```typescript
// 마커 업데이트 시 setPosition()으로 기존 마커 재사용
// → 마커 제거 + 재생성 방지 (DOM 조작 최소화)

// 지도 컨테이너에 will-change: transform 적용
// 터치 이벤트에 passive: true 옵션
```

### 불필요한 리렌더 방지

```typescript
// ParticipantMarker: React.memo + 좌표 비교
export const ParticipantMarker = React.memo(
  ({ participant }: Props) => { ... },
  (prev, next) =>
    prev.participant.participant_locations?.lat === next.participant.participant_locations?.lat &&
    prev.participant.participant_locations?.lng === next.participant.participant_locations?.lng &&
    prev.participant.participant_locations?.status === next.participant.participant_locations?.status
)
```

### 번들 최적화

```typescript
// Kakao Maps SDK: index.html script 태그 (번들 제외)
// React 컴포넌트 lazy loading (페이지 단위)
const AppointmentPage = lazy(() => import('./pages/AppointmentPage'))
const CreatePage = lazy(() => import('./pages/CreatePage'))
```

### TanStack Query 캐시 전략

| 쿼리 | staleTime | gcTime | 이유 |
|------|----------|--------|------|
| 약속 정보 | 30s | 10m | 자주 안 바뀜 |
| 참여자 위치 | 0 | 1m | 항상 최신 필요 |
| 타임라인 | 5s | 5m | 이벤트 빠짐 방지 |

### 위치 업로드 최적화

- 변화량 10m 미만이면 업로드 생략 → Supabase 쓰기 비용 절감
- ETA 계산은 30초 간격 → Kakao API 호출 제한 대응

---

## 20. 향후 확장 가능성

### WebSocket 전환 (Supabase Realtime)

현재 polling 기반 코드를 Realtime으로 교체할 때 변경 범위가 훅에만 국한되도록 설계:

```typescript
// 현재: useParticipants (TanStack Query polling)
// 전환: useParticipants 내부만 Supabase channel.on() 으로 교체
// → 컴포넌트 코드 변경 없음
```

### 인증 시스템 추가

```typescript
// sessionStore의 session_key를 Supabase Auth JWT로 교체
// RLS 정책은 auth.uid() 기반으로 재작성
// 컴포넌트 레이어는 변경 없음
```

### 약속 히스토리 (미래 기능)

```typescript
// appointments 테이블에 user_id 컬럼 추가
// GET /appointments?user_id=xxx 쿼리 추가
// 새 페이지 /history 추가 (라우팅만 확장)
```

### 다국어 지원

```typescript
// i18next 도입 시 모든 UI 텍스트가 컴포넌트에 직접 하드코딩되어 있어
// constants/messages.ts 파일 추출로 일괄 대응 가능
```

### 모바일 앱 전환

```typescript
// React Native / Expo 전환 시
// - hooks/ 레이어: 거의 그대로 재사용
// - stores/: Zustand 그대로
// - lib/api/: 그대로
// - components/ui/: NativeWind로 교체
// → 비즈니스 로직 재작성 없이 UI 레이어만 교체
```

---

*이 문서는 구현 과정에서 발견되는 제약과 결정에 따라 지속적으로 업데이트된다.*
