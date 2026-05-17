-- LateMate DB Schema

-- ── 약속 ─────────────────────────────────────────────
create table if not exists appointments (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  place_name   text not null,
  place_lat    float8 not null,
  place_lng    float8 not null,
  scheduled_at timestamptz not null,
  invite_code  char(6) unique not null,
  created_at   timestamptz default now(),
  expires_at   timestamptz
);

-- ── 참여자 ───────────────────────────────────────────
create table if not exists participants (
  id             uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  nickname       text not null,
  session_key    text not null,
  is_host        boolean default false,
  joined_at      timestamptz default now(),
  unique(appointment_id, nickname)
);

-- ── 최신 위치 (참여자당 1레코드, upsert 전용) ────────
create table if not exists participant_locations (
  participant_id uuid primary key references participants(id) on delete cascade,
  lat            float8,
  lng            float8,
  is_sharing     boolean default false,
  eta_seconds    int,
  status         text check (status in ('on_time', 'late', 'arrived', 'unknown')),
  updated_at     timestamptz default now()
);

-- ── 타임라인 이벤트 ──────────────────────────────────
create table if not exists timeline_events (
  id             uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  participant_id uuid references participants(id) on delete set null,
  event_type     text not null check (event_type in ('JOINED', 'DEPARTED', 'ARRIVED', 'LATE_ALERT')),
  occurred_at    timestamptz default now()
);

-- ── 인덱스 ───────────────────────────────────────────
create index if not exists idx_participants_appointment_id
  on participants(appointment_id);

create index if not exists idx_participant_locations_updated_at
  on participant_locations(updated_at desc);

create index if not exists idx_timeline_events_appointment_id
  on timeline_events(appointment_id);

create index if not exists idx_timeline_events_occurred_at
  on timeline_events(occurred_at desc);

-- ── RLS (MVP 개발 중 비활성화, Phase 10에서 활성화) ──
-- alter table appointments enable row level security;
-- alter table participants enable row level security;
-- alter table participant_locations enable row level security;
-- alter table timeline_events enable row level security;
