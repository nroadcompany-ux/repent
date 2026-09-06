-- RETURN — 0005 Security hardening
-- Closes every finding raised by the Supabase security advisor after 0001–0004.

-- ---------------------------------------------------------------------------
-- 1. community_profiles: SECURITY DEFINER view -> real table (advisor ERROR)
--
-- The view read past the owner-only RLS on `profiles`, which the linter flags
-- and which is also a fragile way to protect church_name / denomination: a
-- future column added to `profiles` would silently become reachable if the
-- view were ever changed to select *. A narrow projection table cannot leak a
-- column it does not have, so the privacy rule in docs/07 holds structurally.
-- ---------------------------------------------------------------------------

drop view if exists public.community_profiles;

create table public.community_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_path text,
  updated_at timestamptz not null default now()
);

alter table public.community_profiles enable row level security;

-- Readable by any signed-in member — this is the nickname-centric community
-- display surface (docs/07). Not readable by anon.
create policy "community_profiles_select_authenticated"
  on public.community_profiles for select to authenticated using (true);

-- No insert/update/delete policy: the table is maintained only by the trigger
-- below, so a member can never write another member's display row.

create or replace function public.sync_community_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.community_profiles (id, display_name, avatar_path)
  values (new.id, new.display_name, new.avatar_path)
  on conflict (id) do update
    set display_name = excluded.display_name,
        avatar_path  = excluded.avatar_path,
        updated_at   = now();
  return new;
end;
$$;

create trigger profiles_sync_community
  after insert or update of display_name, avatar_path on public.profiles
  for each row execute function public.sync_community_profile();

-- Backfill anything already created.
insert into public.community_profiles (id, display_name, avatar_path)
  select id, display_name, avatar_path from public.profiles
  on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Pin search_path on the remaining trigger functions (advisor WARN)
-- ---------------------------------------------------------------------------

alter function public.set_updated_at() set search_path = public;
alter function public.enforce_profile_media_limit() set search_path = public;

-- ---------------------------------------------------------------------------
-- 3. Trigger functions must not be callable over the REST API (advisor WARN)
--    They are SECURITY DEFINER and exist only for their triggers.
-- ---------------------------------------------------------------------------

revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.seed_user_defaults() from anon, authenticated;
revoke execute on function public.sync_community_profile() from anon, authenticated;
revoke execute on function public.set_updated_at() from anon, authenticated;
revoke execute on function public.enforce_profile_media_limit() from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Move pg_trgm out of the public schema (advisor WARN).
--    Dependent GIN indexes keep working: ALTER EXTENSION rewrites the
--    dependency, and `extensions` is already on the default search_path.
-- ---------------------------------------------------------------------------

create schema if not exists extensions;
alter extension pg_trgm set schema extensions;

-- ---------------------------------------------------------------------------
-- 5. moderation_actions intentionally has RLS on and NO policy (advisor INFO).
--    Only the service role may read or write moderation history; there is no
--    member-facing path to it by design (docs/08).
-- ---------------------------------------------------------------------------

comment on table public.moderation_actions is
  'Service-role only. RLS enabled with no policy on purpose: no member-facing read or write path.';
