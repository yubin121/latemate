# PRD: LateMate

> **버전**: 0.1.0  
> **작성일**: 2026-05-17  
> **개발 규모**: 1인 개발 MVP  
> **개발 방식**: AI 기반 바이브코딩

---

## 목차

1. [제품 개요](#1-제품-개요)
2. [문제 정의](#2-문제-정의)
3. [목표 및 비목표](#3-목표-및-비목표)
4. [사용자 흐름](#4-사용자-흐름)
5. [MVP 범위](#5-mvp-범위)
6. [기능 상세 명세](#6-기능-상세-명세)
7. [기능 요구사항](#7-기능-요구사항)
8. [비기능 요구사항](#8-비기능-요구사항)
9. [기술 아키텍처 개요](#9-기술-아키텍처-개요)
10. [상태 관리 전략](#10-상태-관리-전략)
11. [API 및 데이터 흐름](#11-api-및-데이터-흐름)
12. [모바일/반응형 UX 고려사항](#12-모바일반응형-ux-고려사항)
13. [에러 처리 전략](#13-에러-처리-전략)
14. [향후 확장 아이디어](#14-향후-확장-아이디어)
15. [개발 우선순위](#15-개발-우선순위)

---

## 1. 제품 개요

### 제품명

**LateMate** — 지각하지 말자, 함께

### 한 줄 설명

약속을 생성하고 실시간 위치를 공유하며, 누가 지각할지 자동으로 예측해주는 약속 관리 웹 서비스.

### 제품 설명

LateMate는 친구들 간의 약속 자리에서 발생하는 "지금 어디야?", "언제 도착해?"라는 반복적인 문자 메시지를 없애기 위해 만들어진 서비스다. 사용자는 약속을 생성하고 링크를 공유하면, 참여자들이 실시간 위치를 공유하고 서비스가 자동으로 각자의 도착 예상 시간(ETA)을 계산해 지각 여부를 판단한다.

MVP는 핵심 4개 기능에만 집중하며, 불필요한 소셜 기능이나 복잡한 시스템 없이 **위치 공유 → 지각 판단** 단일 흐름을 완성도 높게 구현하는 것을 목표로 한다.

---

## 2. 문제 정의

### 핵심 불편

| 상황                    | 문제                                     |
| ----------------------- | ---------------------------------------- |
| 약속 당일               | "지금 어디야?" 문자를 각자에게 반복 전송 |
| 약속 장소 도착 전       | 친구들이 얼마나 늦을지 알 수 없음        |
| 지각할 것 같을 때       | 먼저 말하기 민망해서 알리지 않음         |
| 약속 장소에서 기다릴 때 | 얼마나 더 기다려야 하는지 불확실         |

### 기존 해결책의 한계

- **카카오톡 라이브 위치**: 단발성, 약속 관리 기능 없음
- **구글 맵 위치 공유**: UX 불편, 한국 지도 정확도 낮음
- **밴드/네이버 약속**: 실시간 위치 공유 없음

### LateMate가 해결하는 것

약속 생성 → 참여자 위치 공유 → 지각 예상 자동 표시를 하나의 흐름으로 제공해, 별도의 문자 없이도 모든 참여자가 서로의 상황을 인지하게 한다.

---

## 3. 목표 및 비목표

### Goals (목표)

- **G1**: 약속 생성 후 링크 공유만으로 참여자를 초대할 수 있다
- **G2**: 참여자가 위치 공유를 시작하면 지도에 실시간(5~10초 갱신)으로 표시된다
- **G3**: 시스템이 자동으로 각 참여자의 ETA를 계산하고 지각 여부를 표시한다
- **G4**: 출발 이벤트를 기록하고 타임라인으로 시각화한다
- **G5**: 모바일 브라우저에서 끊김 없이 동작하는 UX를 제공한다
- **G6**: 회원가입 없이 링크 접속만으로 참여 가능하다 (익명 참여)

### Non-Goals (비목표, 현 MVP에서 제외)

- 채팅 기능
- 소셜 피드 및 히스토리 피드
- 친구 시스템 및 팔로우
- 복잡한 인증 시스템 (OAuth, 소셜 로그인 등)
- WebSocket 기반 실시간 통신
- 푸시 알림 (브라우저/모바일 알림)
- 백그라운드 위치 추적 (앱 미사용 중 추적)
- AI 모델 학습 및 예측 고도화
- 반복 약속 / 정기 모임 기능
- 결제 및 정산 기능
- 지도 길찾기 직접 제공

---

## 4. 사용자 흐름

### 주요 페르소나

**주최자 (Host)**: 약속을 만들고 링크를 공유하는 사람  
**참여자 (Guest)**: 링크로 접속해 위치를 공유하는 사람

### 플로우 다이어그램

```
[주최자]
  │
  ├─ 1. 앱 접속
  ├─ 2. 약속 생성 (제목, 장소, 시간 입력)
  ├─ 3. 초대 링크/코드 복사 → 카톡 등으로 공유
  ├─ 4. 약속 대기 화면 진입 (지도 + 참여자 목록)
  └─ 5. 위치 공유 시작 → 출발 기록

[참여자]
  │
  ├─ 1. 링크 접속
  ├─ 2. 닉네임 입력 (간단 식별용)
  ├─ 3. 약속 정보 확인
  ├─ 4. 위치 공유 시작 → 출발 기록
  └─ 5. 지도에서 모든 참여자 위치 실시간 확인

[시스템]
  │
  ├─ 위치 데이터 수신 (5~10초 polling)
  ├─ Kakao Maps Directions API로 ETA 계산
  ├─ ETA > 약속 시간이면 "지각 예상" 배지 표시
  └─ 출발 이벤트 타임라인에 기록
```

### 핵심 시나리오

**시나리오 A — 정상 흐름**

1. 주최자가 "강남역 앞 12:00" 약속 생성
2. 링크를 카카오톡으로 친구 3명에게 공유
3. 친구들이 링크 클릭 → 닉네임 입력 → 약속 페이지 진입
4. 11:30에 친구들이 각자 "위치 공유 시작" 버튼 클릭
5. 지도에 모든 위치가 표시되고 ETA가 각자 계산됨
6. 한 친구의 ETA가 12:15로 계산되면 "지각 예상" 배지 표시
7. 타임라인에 "홍길동 11:31 출발" 이벤트 기록

**시나리오 B — 위치 거부**

1. 사용자가 위치 권한을 거부함
2. 시스템이 권한 안내 메시지 표시
3. 사용자는 지도만 보기(관람 모드)로 약속 페이지 사용 가능

---

## 5. MVP 범위

### 포함 기능 (In Scope)

| #   | 기능                        | 우선순위 |
| --- | --------------------------- | -------- |
| F1  | 약속 생성 및 초대 링크 생성 | P0       |
| F2  | 참여자 닉네임 입력 및 입장  | P0       |
| F3  | 실시간 위치 공유 (polling)  | P0       |
| F4  | 지도에 참여자 마커 표시     | P0       |
| F5  | ETA 자동 계산               | P1       |
| F6  | 지각 예상 상태 표시         | P1       |
| F7  | 출발 이벤트 기록            | P1       |
| F8  | 참여자 행동 타임라인        | P2       |

### 제외 기능 (Out of Scope)

- 로그인/회원가입 시스템
- 약속 수정/삭제
- 알림 기능
- 채팅
- 약속 히스토리 조회

### 데이터 보존 정책

- 약속 데이터: 약속 시간 기준 +24시간 후 자동 만료
- 위치 데이터: 최신 1개만 유지 (이력 저장 없음)
- 타임라인 이벤트: 약속 종료까지만 보존

---

## 6. 기능 상세 명세

### F1. 약속 생성

**진입점**: 홈 화면 "약속 만들기" 버튼

**입력 필드**

| 필드      | 타입           | 필수 | 제약                  |
| --------- | -------------- | ---- | --------------------- |
| 약속 제목 | text           | O    | 최대 50자             |
| 약속 장소 | 주소 검색      | O    | Kakao 주소 API        |
| 약속 시간 | datetime-local | O    | 현재 시간 이후만 허용 |

**생성 후 동작**

- UUID 기반 약속 ID 발급
- `latemate.app/join/{appointmentId}` 형태의 초대 링크 생성
- 6자리 숫자 초대 코드도 함께 발급
- 클립보드 복사 버튼 제공
- 카카오톡 공유 버튼 제공 (Kakao SDK)
- 생성 직후 약속 대기 화면으로 자동 이동

---

### F2. 참여자 입장

**진입점**: 초대 링크 접속 또는 초대 코드 입력

**입력**

| 필드   | 타입 | 필수 | 제약                         |
| ------ | ---- | ---- | ---------------------------- |
| 닉네임 | text | O    | 최대 10자, 약속 내 중복 불가 |

**동작**

- Supabase anonymous auth 또는 localStorage UUID로 사용자 식별
- 입장 시 `participants` 테이블에 레코드 생성
- 이미 입장한 사용자가 재접속하면 기존 세션 복구

---

### F3. 실시간 위치 공유

**트리거**: 사용자가 "위치 공유 시작" 버튼 클릭

**동작 흐름**

1. 브라우저 `navigator.geolocation.watchPosition` 호출
2. 위치 변화 감지 시 Supabase `participant_locations` 업서트
3. 모든 참여자 클라이언트가 5~10초 interval로 위치 데이터 polling
4. "위치 공유 중지" 버튼 클릭 시 추적 중단, `is_sharing: false` 업데이트

**위치 정밀도**

- `enableHighAccuracy: true`
- `timeout: 5000ms`
- `maximumAge: 3000ms`

**표시 상태**

| 상태            | 마커 표시            |
| --------------- | -------------------- |
| 위치 공유 중    | 컬러 마커 + 닉네임   |
| 위치 공유 안 함 | 회색 마커 (오프라인) |
| 도착 완료       | 체크 마커            |

---

### F4. 지도 화면

**지도 라이브러리**: Kakao Maps JavaScript SDK

**표시 요소**

- 약속 장소 마커 (고정, 강조 표시)
- 참여자별 실시간 위치 마커
- 마커 클릭 시 닉네임 + ETA 말풍선 표시

**지도 초기 뷰**

- 약속 장소를 중심으로 초기 렌더링
- 모든 참여자가 화면에 보이도록 자동 bounds 조정

---

### F5. ETA 자동 계산

**계산 방법**

1. 참여자 현재 위치 → 약속 장소까지 Kakao Directions API 호출
2. 응답에서 `duration` (초) 추출
3. `현재 시각 + duration = 예상 도착 시각` 계산

**지각 판단 로직**

```
예상 도착 시각 > 약속 시각 + 5분(버퍼) → "지각 예상"
예상 도착 시각 <= 약속 시각 + 5분 → "정시 도착 예상"
이미 약속 장소 반경 100m 이내 → "도착"
```

**API 호출 제한 대응**

- ETA는 위치 변화 시마다 즉시 호출하지 않고, 30초 간격으로 최신 위치로 일괄 계산
- API 오류 시 이전 ETA 값 유지 (stale 표시)

---

### F6. 지각 상태 배지

**표시 위치**

- 지도 마커 상단
- 참여자 목록 카드
- 타임라인 이벤트

**상태 종류**

| 상태        | 배지 색상 | 텍스트             |
| ----------- | --------- | ------------------ |
| 정시 예상   | 초록      | "정시 도착 예상"   |
| 지각 예상   | 빨강      | "지각 예상 (+N분)" |
| 도착 완료   | 파랑      | "도착"             |
| 위치 미공유 | 회색      | "위치 없음"        |

---

### F7. 출발 이벤트 기록

**자동 기록 조건**

- 사용자가 "위치 공유 시작" 버튼을 클릭하는 순간 출발 이벤트 생성
- 약속 장소 반경 100m 이내 진입 시 도착 이벤트 자동 생성

**수동 기록**

- "출발했어요" 버튼 (위치 공유 없이도 선언 가능)

**이벤트 타입**

| 타입         | 설명                          |
| ------------ | ----------------------------- |
| `JOINED`     | 약속 참여 완료                |
| `DEPARTED`   | 출발 선언 또는 위치 공유 시작 |
| `ARRIVED`    | 약속 장소 도착                |
| `LATE_ALERT` | 지각 예상 상태 전환           |

---

### F8. 참여자 타임라인

**표시 방식**: 세로 타임라인 (최신 이벤트 상단)

**각 이벤트 카드 내용**

- 닉네임
- 이벤트 타입 아이콘
- 이벤트 발생 시각 (HH:MM 형식)
- 이벤트 설명 텍스트

---

## 7. 기능 요구사항

### 약속 생성

- [x] FR-01: 약속 제목, 장소, 시간을 입력해 약속을 생성할 수 있어야 한다
- [x] FR-02: 생성된 약속에 고유 초대 링크와 6자리 코드가 발급되어야 한다
- [x] FR-03: 초대 링크를 클립보드에 복사할 수 있어야 한다
- [x] FR-04: 약속 시간은 현재 시간 이후만 선택 가능해야 한다
- [x] FR-05: 약속 장소는 Kakao 주소 검색으로 정확한 좌표를 저장해야 한다

### 참여자 입장

- [x] FR-06: 초대 링크 접속 또는 코드 입력으로 약속에 참여할 수 있어야 한다
- [x] FR-07: 닉네임을 입력해 참여자를 식별해야 한다
- [x] FR-08: 동일 기기에서 재접속 시 이전 세션이 복구되어야 한다
- [x] FR-09: 같은 약속 내 닉네임 중복은 허용하지 않아야 한다

### 위치 공유

- [x] FR-10: 사용자가 명시적으로 "위치 공유 시작"을 선택해야만 위치가 공유되어야 한다
- [x] FR-11: 위치 권한 거부 시 안내 메시지를 표시하고 서비스를 계속 사용할 수 있어야 한다
- [x] FR-12: 위치 공유는 언제든지 중단할 수 있어야 한다
- [x] FR-13: 참여자 위치는 5~10초 간격으로 갱신되어야 한다

### 지각 판단

- [x] FR-14: 시스템이 자동으로 ETA를 계산하고 지각 예상 여부를 표시해야 한다
- [x] FR-15: 약속 장소 반경 100m 이내 진입 시 "도착"으로 자동 전환되어야 한다
- [x] FR-16: 지각 예상 시 예상 지각 시간(분)을 함께 표시해야 한다

### 타임라인

- [x] FR-17: 참여자의 주요 행동(참여, 출발, 도착)이 타임라인에 기록되어야 한다
- [x] FR-18: 타임라인은 모든 참여자가 동일하게 볼 수 있어야 한다

---

## 8. 비기능 요구사항

### 성능

| 항목                   | 목표       |
| ---------------------- | ---------- |
| 초기 페이지 로드 (LCP) | 3초 이하   |
| 위치 polling 응답      | 500ms 이하 |
| 지도 초기 렌더링       | 2초 이하   |
| ETA 계산 응답          | 2초 이하   |

### 신뢰성

- 위치 업데이트 실패 시 재시도 3회 후 사용자에게 오류 표시
- Supabase 연결 오류 시 마지막 성공 데이터 표시 (stale-while-revalidate)

### 보안

- 약속 ID는 UUID v4 사용 (예측 불가)
- 사용자 위치 데이터는 약속 참여자끼리만 조회 가능 (RLS 정책)
- HTTPS 필수

### 브라우저 호환성

- Chrome (Android/iOS) 최신 2버전
- Safari (iOS) 최신 2버전
- 데스크탑 Chrome/Safari 지원

### 접근성

- 색상 외 다른 시각 수단으로도 상태 구분 가능 (아이콘, 텍스트 병행)
- 최소 탭 인덱스 설정으로 키보드 네비게이션 부분 지원

---

## 9. 기술 아키텍처 개요

### 전체 구조

```
┌─────────────────────────────────────────┐
│              Client (React)              │
│                                         │
│  ┌─────────────┐  ┌───────────────────┐ │
│  │  Zustand    │  │  TanStack Query   │ │
│  │  (UI State) │  │  (Server State)   │ │
│  └─────────────┘  └───────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │         Kakao Maps SDK              ││
│  └─────────────────────────────────────┘│
└──────────────────┬──────────────────────┘
                   │ HTTP / REST
┌──────────────────▼──────────────────────┐
│              Supabase                    │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │ Database │  │  Auth    │            │
│  │(Postgres)│  │(Anonymous│            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         Kakao APIs (External)            │
│  - Maps JavaScript SDK                   │
│  - Local Search API (주소 검색)           │
│  - Directions API (ETA 계산)             │
└─────────────────────────────────────────┘
```

### 폴더 구조

```
src/
├── components/
│   ├── appointment/       # 약속 생성/상세 관련 컴포넌트
│   ├── map/               # 지도, 마커 컴포넌트
│   ├── participant/       # 참여자 목록, 카드
│   ├── timeline/          # 타임라인 관련
│   └── ui/                # 공용 UI (Button, Badge, Modal 등)
├── hooks/
│   ├── useGeolocation.ts  # 브라우저 위치 추적
│   ├── usePolling.ts      # polling 유틸리티
│   ├── useEta.ts          # ETA 계산 로직
│   └── useAppointment.ts  # 약속 데이터 조회
├── pages/
│   ├── Home.tsx           # 홈 (약속 만들기 진입)
│   ├── Create.tsx         # 약속 생성 폼
│   ├── Join.tsx           # 초대 링크 입장 (닉네임 입력)
│   └── Appointment.tsx    # 약속 메인 화면 (지도 + 목록 + 타임라인)
├── stores/
│   ├── sessionStore.ts    # 현재 사용자 세션 (닉네임, participantId)
│   └── locationStore.ts   # 위치 공유 상태 (isSharing, coords)
├── lib/
│   ├── supabase.ts        # Supabase 클라이언트
│   ├── kakao.ts           # Kakao API 래퍼
│   └── eta.ts             # ETA 계산 유틸
└── types/
    └── index.ts           # 공용 타입 정의
```

### 라우팅 구조

```
/                    → Home (약속 만들기 / 코드 입력)
/create              → Create (약속 생성 폼)
/join/:appointmentId → Join (닉네임 입력)
/appointment/:id     → Appointment (메인 화면)
```

---

## 10. 상태 관리 전략

### 원칙

- **서버 상태** (약속 정보, 참여자 목록, 위치 데이터): TanStack Query
- **클라이언트 UI 상태** (위치 공유 여부, 현재 사용자 세션): Zustand
- **컴포넌트 로컬 상태** (모달 열림, 폼 입력값): useState

### Zustand 스토어 설계

```typescript
// sessionStore.ts
interface SessionStore {
  participantId: string | null;
  nickname: string | null;
  appointmentId: string | null;
  setSession: (data: SessionData) => void;
  clearSession: () => void;
}

// locationStore.ts
interface LocationStore {
  isSharing: boolean;
  currentCoords: { lat: number; lng: number } | null;
  startSharing: () => void;
  stopSharing: () => void;
  updateCoords: (coords: Coords) => void;
}
```

### TanStack Query 설계

```typescript
// 약속 정보 조회
useQuery({
  queryKey: ['appointment', appointmentId],
  queryFn: () => fetchAppointment(appointmentId),
  staleTime: 30_000,
});

// 참여자 위치 polling
useQuery({
  queryKey: ['participants', appointmentId],
  queryFn: () => fetchParticipantLocations(appointmentId),
  refetchInterval: 7_000, // 7초 polling
  refetchIntervalInBackground: false,
});

// 타임라인 이벤트 polling
useQuery({
  queryKey: ['timeline', appointmentId],
  queryFn: () => fetchTimeline(appointmentId),
  refetchInterval: 10_000,
});
```

---

## 11. API 및 데이터 흐름

### Supabase 테이블 스키마

```sql
-- 약속
create table appointments (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  place_name  text not null,
  place_lat   float8 not null,
  place_lng   float8 not null,
  scheduled_at timestamptz not null,
  invite_code  char(6) unique not null,
  created_at  timestamptz default now(),
  expires_at  timestamptz   -- scheduled_at + 24h
);

-- 참여자
create table participants (
  id              uuid primary key default gen_random_uuid(),
  appointment_id  uuid references appointments(id),
  nickname        text not null,
  session_key     text not null,  -- localStorage UUID
  is_host         boolean default false,
  joined_at       timestamptz default now(),
  unique(appointment_id, nickname)
);

-- 최신 위치 (1인 1레코드, 업서트)
create table participant_locations (
  participant_id  uuid primary key references participants(id),
  lat             float8,
  lng             float8,
  is_sharing      boolean default false,
  eta_seconds     int,            -- 목적지까지 남은 초
  status          text,           -- 'on_time' | 'late' | 'arrived'
  updated_at      timestamptz default now()
);

-- 타임라인 이벤트
create table timeline_events (
  id              uuid primary key default gen_random_uuid(),
  appointment_id  uuid references appointments(id),
  participant_id  uuid references participants(id),
  event_type      text not null,  -- 'JOINED' | 'DEPARTED' | 'ARRIVED' | 'LATE_ALERT'
  occurred_at     timestamptz default now()
);
```

### RLS 정책

```sql
-- appointments: 누구나 읽기 가능 (링크 공유 특성상)
-- participants: 같은 appointment_id의 참여자만 조회
-- participant_locations: 같은 appointment_id의 참여자만 조회
-- timeline_events: 같은 appointment_id의 참여자만 조회
```

### 핵심 데이터 흐름

**위치 업데이트 흐름**

```
브라우저 GPS
  → watchPosition callback
  → locationStore.updateCoords()
  → supabase.upsert('participant_locations', {...})
  → 다른 클라이언트 polling 수신
  → 지도 마커 업데이트
```

**ETA 계산 흐름**

```
30초 interval
  → 현재 coords + 약속 장소 coords
  → Kakao Directions API 호출
  → duration 파싱
  → 현재 시각 + duration = ETA
  → ETA > 약속 시각 + 5분 → status = 'late'
  → supabase.update('participant_locations', {eta_seconds, status})
```

### Kakao API 사용 목록

| API              | 사용 목적              | 호출 시점         |
| ---------------- | ---------------------- | ----------------- |
| Maps JS SDK      | 지도 렌더링, 마커 표시 | 약속 화면 진입 시 |
| Local Search API | 약속 장소 주소 검색    | 약속 생성 시      |
| Directions API   | ETA 계산               | 30초 interval     |

---

## 12. 모바일/반응형 UX 고려사항

### 레이아웃 전략

**모바일 (< 768px)**

```
┌──────────────────┐
│   헤더 (약속 정보)  │
├──────────────────┤
│                  │
│   카카오 지도      │
│   (화면 50%)      │
│                  │
├──────────────────┤
│  ▲ 드래그하면 목록  │
├──────────────────┤
│   참여자 목록 카드  │
│   타임라인         │
└──────────────────┘
```

- 지도와 목록을 Bottom Sheet 패턴으로 분리
- 스와이프 업으로 목록 확장, 다운으로 지도 확장

**데스크탑 (≥ 768px)**

```
┌──────────┬───────────────┐
│  사이드바  │               │
│  약속 정보 │   카카오 지도   │
│  참여자   │               │
│  목록     │               │
│  타임라인  │               │
└──────────┴───────────────┘
```

### 모바일 UX 주의사항

- **터치 영역**: 모든 버튼 최소 44×44px
- **폰트 크기**: 최소 14px (iOS 자동 확대 방지)
- **위치 권한 안내**: iOS Safari는 HTTPS에서만 동작 — 명확한 안내 문구 제공
- **Bottom Sheet**: `overscroll-behavior: contain` 적용해 iOS 스크롤 튕김 방지
- **지도 터치**: `passiveEventListeners` 설정으로 스크롤 성능 최적화
- **Safe Area**: iOS 노치/홈바 영역 `env(safe-area-inset-*)` 처리

### 위치 권한 UX

```
권한 요청 전:
  → "지도에서 내 위치를 보여드릴게요. 위치 공유를 시작할까요?" 안내
  → [시작하기] [나중에] 버튼

권한 거부 시:
  → "위치 공유 없이도 다른 참여자의 위치는 볼 수 있어요"
  → 설정에서 권한 허용하는 방법 안내 링크

권한 허용 후:
  → 즉시 위치 공유 시작 + 출발 이벤트 자동 기록
```

---

## 13. 에러 처리 전략

### 에러 유형별 처리

| 에러 유형               | 처리 방법                  | 사용자 메시지                    |
| ----------------------- | -------------------------- | -------------------------------- |
| 위치 권한 거부          | 관람 모드로 전환           | "위치 공유 없이 계속합니다"      |
| GPS 오류 (timeout)      | 이전 위치 유지, 재시도     | "위치를 가져오는 중..."          |
| Supabase 연결 오류      | stale 데이터 표시 + 재시도 | "연결 중... 잠시만 기다려주세요" |
| ETA API 오류            | 이전 ETA 유지, 스테일 표시 | ETA 숫자 옆 `(업데이트 중)`      |
| 약속 없음 (잘못된 링크) | 홈으로 리다이렉트          | "약속을 찾을 수 없어요"          |
| 닉네임 중복             | 인라인 오류 표시           | "이미 사용 중인 닉네임이에요"    |
| 약속 만료               | 만료 안내 화면             | "종료된 약속이에요"              |

### 전역 에러 경계

```typescript
// React ErrorBoundary로 예외 포착
// Supabase 오류는 TanStack Query의 onError 콜백에서 처리
// 위치 오류는 useGeolocation 훅 내부에서 처리
```

### 네트워크 불안정 대응

- TanStack Query `retry: 3` 기본 설정
- 오프라인 감지 시 "인터넷 연결을 확인해주세요" 토스트 표시
- 재연결 시 자동으로 데이터 재조회

---

## 14. 향후 확장 아이디어

> MVP 완성 후 순차적으로 검토할 기능들 (현재 구현 범위 아님)

### 단기 (MVP 검증 후)

- **약속 수정**: 시간/장소 변경 기능
- **카카오 로그인**: 익명 세션 한계 극복, 약속 히스토리 제공
- **지각 알림**: 지각 예상 시 브라우저 알림 (Web Notification API)
- **어두운 모드**: prefers-color-scheme 지원

### 중기

- **WebSocket 전환**: Supabase Realtime으로 전환해 polling 제거
- **약속 히스토리**: 사용자별 과거 약속 목록 조회
- **지각 통계**: "홍길동은 평균 8분 지각" 재미 요소

### 장기

- **네이티브 앱**: React Native / Expo로 iOS/Android 앱 출시
- **백그라운드 위치**: 앱이 백그라운드일 때도 위치 갱신
- **정기 모임**: 매주 반복되는 약속 설정

---

## 15. 개발 우선순위

### Phase 0 — 프로젝트 셋업 (1일)

- [ ] Vite + React + TypeScript 초기화
- [ ] TailwindCSS 설정
- [ ] TanStack Query, Zustand, React Router 설치
- [ ] Supabase 프로젝트 생성 및 스키마 마이그레이션
- [ ] Kakao Maps API 키 발급 및 연동 확인
- [ ] 기본 라우팅 구조 (`/`, `/create`, `/join/:id`, `/appointment/:id`)

### Phase 1 — 핵심 데이터 흐름 (2~3일)

- [ ] 약속 생성 폼 및 Supabase 연동
- [ ] 초대 링크 생성 및 클립보드 복사
- [ ] 닉네임 입력 및 참여자 등록
- [ ] 세션 유지 (localStorage)

### Phase 2 — 지도 및 위치 공유 (3~4일)

- [ ] Kakao Maps 지도 렌더링
- [ ] 약속 장소 마커 표시
- [ ] `useGeolocation` 훅 구현
- [ ] 위치 Supabase 업서트
- [ ] 참여자 위치 polling 및 마커 업데이트

### Phase 3 — ETA 및 지각 판단 (2일)

- [ ] Kakao Directions API 연동
- [ ] ETA 계산 로직 (`useEta` 훅)
- [ ] 지각 상태 판단 및 배지 표시
- [ ] 도착 감지 (100m 이내)

### Phase 4 — 타임라인 (1~2일)

- [ ] 타임라인 이벤트 기록 로직
- [ ] 타임라인 UI 컴포넌트
- [ ] 자동 이벤트 생성 (출발, 도착)

### Phase 5 — UX 완성도 (2~3일)

- [ ] 모바일 Bottom Sheet 레이아웃
- [ ] 에러 처리 및 로딩 상태 UI
- [ ] 위치 권한 거부 안내 화면
- [ ] 약속 만료 처리

### Phase 6 — 배포 및 QA (1~2일)

- [ ] Vercel 배포 설정
- [ ] 환경 변수 관리 (.env.local)
- [ ] 실기기(iOS Safari, Android Chrome) 테스트
- [ ] Supabase RLS 정책 검증

### 총 예상 개발 기간

> 1인 기준 약 **2~3주** (하루 4~6시간 작업 기준)

---

## 부록

### 환경 변수 목록

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_KAKAO_MAP_KEY=
VITE_KAKAO_REST_API_KEY=
```

### 외부 서비스 의존성

| 서비스               | 용도        | 무료 한도                 |
| -------------------- | ----------- | ------------------------- |
| Supabase             | DB, Auth    | 500MB, 50K MAU            |
| Kakao Maps JS SDK    | 지도 렌더링 | 제한 없음 (개인 프로젝트) |
| Kakao Local API      | 주소 검색   | 300K QPS                  |
| Kakao Directions API | ETA 계산    | 300K QPS                  |
| Vercel               | 호스팅      | 무료 플랜 충분            |

### 참고 기술 문서

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Kakao Maps SDK v3](https://apis.map.kakao.com/web/documentation/)
- [TanStack Query v5](https://tanstack.com/query/latest)
- [Zustand v5](https://zustand.docs.pmnd.rs/)

---

_이 문서는 MVP 개발 과정에서 실제 구현 결과에 따라 지속적으로 업데이트된다._
