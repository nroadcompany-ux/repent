-- RETURN — 0001 Foundation & Profile
-- Canonical source: docs/00, docs/04, docs/05, docs/07
--
-- Product rules encoded here:
--   * Row Level Security is enabled on every table (docs/07 Security Baseline).
--   * church_name / denomination are NEVER auto-public (docs/04, docs/07, AC-07).
--   * Profile Gallery is capped at 30 items (docs/04, AC-07).
--   * No spiritual-state enum is defined anywhere in this schema (docs/00, docs/05).

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------------------
-- Shared enums (physical only — user-facing meaning stays canonical)
-- ---------------------------------------------------------------------------

-- Record lifecycle. Deliberately NOT a spiritual state.
create type public.record_state as enum ('draft', 'recorded', 'archived');

-- Visibility of a profile surface. Private records never rely on this alone.
create type public.visibility as enum ('private', 'public');

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  church_name text,
  denomination text,
  -- docs/04: "교회명/교단 자동 공개 금지. 공개는 사용자 선택."
  church_info_public boolean not null default false,
  -- docs/04: "대표 프로필 사진 1장" — storage object path, not a public URL.
  avatar_path text,
  bio text,
  profile_visibility public.visibility not null default 'private',
  terms_agreed_at timestamptz,
  privacy_agreed_at timestamptz,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Community surfaces read a deliberately narrow projection through
-- public.community_profiles (defined in 0003), never this table directly.
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- profile_media — Gallery, max 30 (docs/04, AC-07)
-- ---------------------------------------------------------------------------

create table public.profile_media (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  category text,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index profile_media_user_idx on public.profile_media (user_id, sort_order);

create or replace function public.enforce_profile_media_limit()
returns trigger
language plpgsql
as $$
declare
  media_count integer;
begin
  select count(*) into media_count
    from public.profile_media
    where user_id = new.user_id;

  if media_count >= 30 then
    raise exception 'PROFILE_GALLERY_LIMIT: 프로필 갤러리는 최대 30장까지 등록할 수 있습니다.';
  end if;

  return new;
end;
$$;

create trigger profile_media_limit
  before insert on public.profile_media
  for each row execute function public.enforce_profile_media_limit();

alter table public.profile_media enable row level security;

create policy "profile_media_all_own"
  on public.profile_media for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- profile_hashtags (docs/04, AC-07)
-- ---------------------------------------------------------------------------

create table public.profile_hashtags (
  user_id uuid not null references auth.users(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, tag)
);

alter table public.profile_hashtags enable row level security;

create policy "profile_hashtags_all_own"
  on public.profile_hashtags for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- onboarding_answers — the 3 opening questions (docs/00, docs/02)
-- Sensitive personal reflection: owner-only, never surfaced to community.
-- ---------------------------------------------------------------------------

create table public.onboarding_answers (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_key text not null check (question_key in ('q1_word', 'q2_walk', 'q3_promise')),
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, question_key)
);

create trigger onboarding_answers_set_updated_at
  before update on public.onboarding_answers
  for each row execute function public.set_updated_at();

alter table public.onboarding_answers enable row level security;

create policy "onboarding_answers_all_own"
  on public.onboarding_answers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Auto-provision a profile row for every new auth user.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      ''
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
