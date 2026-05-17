-- LateMate RLS Policies

-- ── RLS 활성화 ────────────────────────────────────────
alter table appointments enable row level security;
alter table participants enable row level security;
alter table participant_locations enable row level security;
alter table timeline_events enable row level security;

-- ── 약속 ─────────────────────────────────────────────
create policy "appointments_select" on appointments for select using (true);
create policy "appointments_insert" on appointments for insert with check (true);

-- ── 참여자 ───────────────────────────────────────────
create policy "participants_select" on participants for select using (true);
create policy "participants_insert" on participants for insert with check (true);

-- ── 위치 ─────────────────────────────────────────────
create policy "locations_select" on participant_locations for select using (true);
create policy "locations_upsert" on participant_locations for insert with check (true);
create policy "locations_update" on participant_locations for update using (true);

-- ── 타임라인 ──────────────────────────────────────────
create policy "timeline_select" on timeline_events for select using (true);
create policy "timeline_insert" on timeline_events for insert with check (true);
