-- RETURN — 0002 Private Domains: Prayer / Repentance / Promise+Action / Journey / Scripture
-- Canonical source: docs/01, docs/02, docs/04, docs/05, docs/07
--
-- Product rules encoded here:
--   * Every row in this migration is owner-only by default (docs/07 Default Privacy).
--   * Journey owns aggregation/navigation, never a copy of another domain's source (docs/01, docs/05).
--   * Mood: 5-step self record. No row = Missing. No interpolation (docs/04, AC-02).
--   * Mood is NOT convertible to 신앙 수준 / 하나님과의 거리 / 영적 상태 (docs/04) — hence a single
--     self-reported `level` and no faith/spiritual scoring column exists anywhere below.
--   * Promise 1:N Action; 이행률은 행동 측정치 (docs/04, AC-05).
--   * Scripture verse TEXT stays empty until the license is approved (docs/04, docs/10 HOLD 6).

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.prayer_kind as enum ('mine', 'intercession');
create type public.promise_state as enum ('active', 'closed');

-- docs/04: Retry / Modify / Reschedule / Record Only / Optional Repent.
-- 'record_only' exists precisely so a non-completion never has to be a failure,
-- and no member of this enum means sin.
create type public.action_outcome as enum (
  'done', 'retry', 'modified', 'rescheduled', 'record_only'
);

-- ---------------------------------------------------------------------------
-- PRAYER — 기도함 → 기도 제목 → 날짜별 기도 기록 (docs/01 Hierarchy)
-- ---------------------------------------------------------------------------

create table public.prayer_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index prayer_folders_user_idx on public.prayer_folders (user_id, sort_order);
create trigger prayer_folders_set_updated_at before update on public.prayer_folders
  for each row execute function public.set_updated_at();

create table public.prayer_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  folder_id uuid references public.prayer_folders(id) on delete set null,
  kind public.prayer_kind not null default 'mine',
  title text not null,
  -- 중보기도 대상. Free text; never used as an identity claim.
  subject_name text,
  body text,
  state public.record_state not null default 'recorded',
  -- No `answered` column: docs/04 forbids the system judging 응답/미응답.
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index prayer_topics_user_idx on public.prayer_topics (user_id, kind, created_at desc);
create trigger prayer_topics_set_updated_at before update on public.prayer_topics
  for each row execute function public.set_updated_at();

create table public.prayer_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.prayer_topics(id) on delete cascade,
  prayed_on date not null default (now() at time zone 'Asia/Seoul')::date,
  body text not null default '',
  -- Voice memo, under 60s, stored in the private `voice` bucket.
  voice_path text,
  voice_duration_ms integer check (voice_duration_ms is null or voice_duration_ms <= 60000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index prayer_records_topic_idx on public.prayer_records (topic_id, prayed_on desc);
create index prayer_records_user_date_idx on public.prayer_records (user_id, prayed_on desc);
create trigger prayer_records_set_updated_at before update on public.prayer_records
  for each row execute function public.set_updated_at();

-- 기도문 — prepared prayers (주일예배 / 소모임 기도회 등 대표기도 포함)
create table public.prayer_texts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  occasion text,
  body text not null default '',
  state public.record_state not null default 'recorded',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index prayer_texts_user_idx on public.prayer_texts (user_id, created_at desc);
create trigger prayer_texts_set_updated_at before update on public.prayer_texts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- REPENTANCE — 돌아보기 → 깨닫기 → 돌이킴 약속 → 돌아가기 (docs/01, AC-04)
-- ---------------------------------------------------------------------------

create table public.repentances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  -- Canonical 4 stages. All nullable: Draft 임시저장 + 이어쓰기 (AC-04).
  looking_back text,
  realization text,
  turning_promise text,
  returning_note text,
  voice_path text,
  voice_duration_ms integer check (voice_duration_ms is null or voice_duration_ms <= 60000),
  -- Draft while writing, 'recorded' only after `회개 기록 마치기`.
  state public.record_state not null default 'draft',
  recorded_at timestamptz,
  -- No completion %, no spiritual score, no forgiveness flag (AC-04).
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index repentances_user_idx on public.repentances (user_id, created_at desc);
create trigger repentances_set_updated_at before update on public.repentances
  for each row execute function public.set_updated_at();

create table public.repentance_scriptures (
  repentance_id uuid not null references public.repentances(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text not null,
  primary key (repentance_id, reference)
);

-- ---------------------------------------------------------------------------
-- PROMISE / ACTION (docs/01, docs/04, AC-05)
-- ---------------------------------------------------------------------------

create table public.promise_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index promise_groups_user_idx on public.promise_groups (user_id, sort_order);

create table public.promises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid references public.promise_groups(id) on delete set null,
  title text not null,
  -- 약속의 근거: 상황 / 목적
  background text,
  purpose text,
  -- 기한이 있는 약속이면 D-day 및 달성률 계산 근거가 된다.
  started_on date not null default (now() at time zone 'Asia/Seoul')::date,
  due_date date,
  -- 하루에 2~10번 해야 하는 약속 지원.
  daily_target smallint not null default 1 check (daily_target between 1 and 10),
  state public.promise_state not null default 'active',
  -- user-facing finish label is `마무리됨` (docs/04).
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index promises_user_idx on public.promises (user_id, state, created_at desc);
create trigger promises_set_updated_at before update on public.promises
  for each row execute function public.set_updated_at();

-- Daily keep-ledger. One row per promise per day; absent row = not recorded,
-- which is NOT a failure and NOT a sin (docs/04 Action Failure != Sin).
create table public.promise_checks (
  promise_id uuid not null references public.promises(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  check_date date not null,
  done_count smallint not null default 0 check (done_count >= 0),
  note text,
  updated_at timestamptz not null default now(),
  primary key (promise_id, check_date)
);
create index promise_checks_user_date_idx on public.promise_checks (user_id, check_date desc);
create trigger promise_checks_set_updated_at before update on public.promise_checks
  for each row execute function public.set_updated_at();

create table public.actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  promise_id uuid not null references public.promises(id) on delete cascade,
  title text not null,
  planned_for date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index actions_promise_idx on public.actions (promise_id, planned_for);
create trigger actions_set_updated_at before update on public.actions
  for each row execute function public.set_updated_at();

create table public.action_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_id uuid not null references public.actions(id) on delete cascade,
  outcome public.action_outcome not null default 'record_only',
  note text,
  recorded_on date not null default (now() at time zone 'Asia/Seoul')::date,
  -- Optional Repent: the user may choose to link a repentance. Never automatic.
  repentance_id uuid references public.repentances(id) on delete set null,
  created_at timestamptz not null default now()
);
create index action_records_action_idx on public.action_records (action_id, recorded_on desc);
create index action_records_user_idx on public.action_records (user_id, recorded_on desc);

-- docs/04: Reminder는 Promise/Action 사용자 설정형만 MVP 허용.
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  promise_id uuid references public.promises(id) on delete cascade,
  action_id uuid references public.actions(id) on delete cascade,
  remind_at time not null,
  weekdays smallint[] not null default '{0,1,2,3,4,5,6}',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  constraint reminders_target_present check (promise_id is not null or action_id is not null)
);
create index reminders_user_idx on public.reminders (user_id, enabled);

-- ---------------------------------------------------------------------------
-- JOURNEY (docs/01, docs/04, AC-02)
-- ---------------------------------------------------------------------------

-- 5-step self record. No row for a day = Missing. Never interpolated.
create table public.mood_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  recorded_on date not null,
  level smallint not null check (level between 1 and 5),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, recorded_on)
);
create trigger mood_records_set_updated_at before update on public.mood_records
  for each row execute function public.set_updated_at();

-- 생애 사건 레이어. This is the only Journey layer drawn as a connected line.
create table public.life_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  occurred_on date not null,
  title text not null,
  body text,
  category text,
  -- Self-reported significance of the event, -5..5. Not a faith measurement.
  significance smallint not null default 0 check (significance between -5 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index life_events_user_idx on public.life_events (user_id, occurred_on);
create trigger life_events_set_updated_at before update on public.life_events
  for each row execute function public.set_updated_at();

-- 나의 말씀
create table public.saved_scriptures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text not null,
  memo text,
  saved_on date not null default (now() at time zone 'Asia/Seoul')::date,
  created_at timestamptz not null default now()
);
create index saved_scriptures_user_idx on public.saved_scriptures (user_id, saved_on desc);

-- 성경읽기표
create table public.bible_reading_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  book text not null,
  chapter smallint not null check (chapter > 0),
  read_on date not null default (now() at time zone 'Asia/Seoul')::date,
  primary key (user_id, book, chapter)
);
create index bible_reading_progress_user_idx on public.bible_reading_progress (user_id, read_on desc);

-- ---------------------------------------------------------------------------
-- SCRIPTURE — canonical reference only.
-- docs/04: "Full Text는 License 확보 후에만 제공."
-- `verse_texts` is created but intentionally left EMPTY. Loading 우리말성경 or any
-- other full text before license approval is forbidden (docs/10 HOLD 6).
-- ---------------------------------------------------------------------------

create table public.verses (
  id text primary key,
  book text not null,
  chapter smallint not null,
  verse smallint not null,
  unique (book, chapter, verse)
);

create table public.verse_texts (
  verse_id text not null references public.verses(id) on delete cascade,
  translation text not null,
  body text not null,
  license_approved boolean not null default false,
  primary key (verse_id, translation)
);

-- ---------------------------------------------------------------------------
-- RLS — owner-only for every private table above.
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
  owner_tables text[] := array[
    'prayer_folders', 'prayer_topics', 'prayer_records', 'prayer_texts',
    'repentances', 'repentance_scriptures',
    'promise_groups', 'promises', 'promise_checks', 'actions', 'action_records', 'reminders',
    'mood_records', 'life_events', 'saved_scriptures', 'bible_reading_progress'
  ];
begin
  foreach t in array owner_tables loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t || '_all_own', t
    );
  end loop;
end;
$$;

-- Scripture reference tables are readable by any signed-in user, writable by nobody
-- through the anon/authenticated roles.
alter table public.verses enable row level security;
create policy "verses_select_authenticated" on public.verses for select
  to authenticated using (true);

alter table public.verse_texts enable row level security;
create policy "verse_texts_select_licensed" on public.verse_texts for select
  to authenticated using (license_approved = true);
