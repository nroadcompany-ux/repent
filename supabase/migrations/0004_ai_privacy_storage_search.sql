-- RETURN — 0004 AI consent / Storage / Search / Default structure
-- Canonical: docs/01, docs/04, docs/06, docs/07, AC-02, AC-05, AC-10

-- ---------------------------------------------------------------------------
-- AI Memory consent — Default OFF, explicit opt-in only (docs/06, docs/07, AC-10)
-- The absence of a row means OFF. Nothing reads past records into an AI context
-- unless `enabled` is explicitly true.
-- ---------------------------------------------------------------------------

create table public.ai_memory_consent (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  enabled_at timestamptz,
  revoked_at timestamptz,
  updated_at timestamptz not null default now()
);
create trigger ai_memory_consent_set_updated_at before update on public.ai_memory_consent
  for each row execute function public.set_updated_at();

alter table public.ai_memory_consent enable row level security;
create policy "ai_memory_consent_all_own" on public.ai_memory_consent for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Audit metadata only. Prayer / Repentance body text must NEVER be written here
-- ("민감한 Prayer / Repentance 본문을 Error Log에 그대로 남기지 않는다"), which is why
-- this table has no content column at all.
create table public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  domain text not null,
  capability text not null,
  used_memory boolean not null default false,
  created_at timestamptz not null default now()
);
create index ai_usage_events_user_idx on public.ai_usage_events (user_id, created_at desc);

alter table public.ai_usage_events enable row level security;
create policy "ai_usage_events_select_own" on public.ai_usage_events for select to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Default structure for a new user.
-- Structure only — docs/07 and the Owner order forbid auto-generating sample
-- 회개 / 기도 / 고백 content in Production, so nothing below creates a record.
-- ---------------------------------------------------------------------------

create or replace function public.seed_user_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- docs/04 기본 그룹
  insert into public.promise_groups (user_id, name, is_default, sort_order) values
    (new.id, '나의 삶', true, 0),
    (new.id, '사람과 관계', true, 1),
    (new.id, '신앙생활', true, 2)
  on conflict do nothing;

  -- docs/01 기도함 → 기도 제목 → 날짜별 기도 기록
  insert into public.prayer_folders (user_id, name, sort_order)
  values (new.id, '나의 기도함', 0)
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute function public.seed_user_defaults();

-- ---------------------------------------------------------------------------
-- Search indexes — docs/01: Search + Filter lives inside Journey.
-- ---------------------------------------------------------------------------

create index prayer_topics_title_trgm on public.prayer_topics using gin (title gin_trgm_ops);
create index prayer_records_body_trgm on public.prayer_records using gin (body gin_trgm_ops);
create index prayer_texts_title_trgm on public.prayer_texts using gin (title gin_trgm_ops);
create index repentances_title_trgm on public.repentances using gin (title gin_trgm_ops);
create index promises_title_trgm on public.promises using gin (title gin_trgm_ops);
create index life_events_title_trgm on public.life_events using gin (title gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Storage buckets. All PRIVATE — docs/07 "Storage에도 Access Policy 적용".
-- Confession photos are reachable by other members through short-lived signed
-- URLs minted server-side, never by making the bucket public.
-- Object key convention: <user_id>/<uuid>.<ext>
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',    'avatars',    false, 5242880,  array['image/jpeg','image/png','image/webp']),
  ('gallery',    'gallery',    false, 5242880,  array['image/jpeg','image/png','image/webp']),
  ('confession', 'confession', false, 5242880,  array['image/jpeg','image/png','image/webp']),
  ('voice',      'voice',      false, 2097152,  array['audio/webm','audio/mp4','audio/mpeg'])
on conflict (id) do nothing;

-- Owner-only buckets.
create policy "storage_owner_read" on storage.objects for select to authenticated
  using (
    bucket_id in ('avatars', 'gallery', 'voice')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_owner_write" on storage.objects for insert to authenticated
  with check (
    bucket_id in ('avatars', 'gallery', 'voice', 'confession')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_owner_update" on storage.objects for update to authenticated
  using (
    bucket_id in ('avatars', 'gallery', 'voice', 'confession')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_owner_delete" on storage.objects for delete to authenticated
  using (
    bucket_id in ('avatars', 'gallery', 'voice', 'confession')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Confession photos are readable by signed-in members, because the post they
-- belong to is a deliberate public share.
create policy "storage_confession_read" on storage.objects for select to authenticated
  using (bucket_id = 'confession');
