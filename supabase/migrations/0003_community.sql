-- RETURN — 0003 Confession Community
-- Canonical: docs/01, docs/04, docs/05, docs/07, docs/08, AC-06/08/09
--
-- Product rules encoded here:
--   * Private Original and public ShareCopy are SEPARATE OBJECTS. A ShareCopy
--     records only a soft pointer (source_kind + source_id, no FK), so deleting
--     the source can never cascade into the published copy (docs/05, AC-08).
--   * 1 user : 1 reaction per post, changeable — enforced by the primary key.
--   * No 인기순 / TOP / ranking column exists, and none may be added (docs/04, docs/08).
--   * Community display is nickname-centric; church_name / denomination are never
--     exposed through the community projection (docs/07).
--   * Reports carry no spiritual reason. `신앙이 틀림` / `회개가 부족함` are not
--     representable in the report_reason enum (docs/08).

create type public.confession_type as enum ('prayer', 'confession', 'grace', 'daily');

-- Canonical 3종 (docs/04, AC-06). The latest Owner execution order runs the
-- community with 공감 1종; the enum keeps all three so enabling the rest is a
-- config change, not a migration. See src/domain/product-lock.ts.
create type public.reaction_type as enum ('pray_together', 'received_grace', 'touched');

create type public.report_reason as enum ('personal_info', 'harassment', 'spam', 'safety');
create type public.report_state as enum ('open', 'reviewing', 'actioned', 'dismissed');
create type public.moderation_action_type as enum ('hide', 'unhide', 'delete', 'restrict', 'restore');

-- Soft pointer to a private source record. Deliberately not a foreign key.
create type public.share_source_kind as enum (
  'repentance', 'prayer_record', 'prayer_topic', 'promise', 'action_record'
);

-- ---------------------------------------------------------------------------
-- confession_posts
-- ---------------------------------------------------------------------------

create table public.confession_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.confession_type not null,
  body text not null default '',
  -- docs/04: 게시물 Photo 최대 1장. One nullable column enforces the cap by shape.
  photo_path text,
  -- ShareCopy provenance. No FK: the source may be deleted while this stays.
  source_kind public.share_source_kind,
  source_id uuid,
  -- Set when the user deleted the source and chose to keep this copy (AC-08).
  source_detached_at timestamptz,
  hidden_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index confession_posts_feed_idx on public.confession_posts (created_at desc)
  where hidden_at is null;
create index confession_posts_user_idx on public.confession_posts (user_id, created_at desc);
create trigger confession_posts_set_updated_at before update on public.confession_posts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- confession_comments
-- Canonical docs/04 includes Comment in MVP; the latest Owner execution order
-- lists "Confession comments" under DO NOT INVENT. The table exists so the
-- canonical shape is preserved, but no RLS policy grants INSERT, so the feature
-- is disabled at the database boundary until the Owner decides.
-- ---------------------------------------------------------------------------

create table public.confession_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.confession_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);
create index confession_comments_post_idx on public.confession_comments (post_id, created_at);

-- ---------------------------------------------------------------------------
-- confession_reactions — 1 user : 1 reaction / post, changeable
-- ---------------------------------------------------------------------------

create table public.confession_reactions (
  post_id uuid not null references public.confession_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.reaction_type not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index confession_reactions_post_idx on public.confession_reactions (post_id);

-- ---------------------------------------------------------------------------
-- hashtags
-- ---------------------------------------------------------------------------

create table public.post_hashtags (
  post_id uuid not null references public.confession_posts(id) on delete cascade,
  tag text not null,
  primary key (post_id, tag)
);
create index post_hashtags_tag_idx on public.post_hashtags (tag);

-- ---------------------------------------------------------------------------
-- Safety: block / report / moderation (docs/08)
-- ---------------------------------------------------------------------------

create table public.user_blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint user_blocks_not_self check (blocker_id <> blocked_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid references public.confession_posts(id) on delete cascade,
  reported_user_id uuid references auth.users(id) on delete cascade,
  reason public.report_reason not null,
  detail text,
  state public.report_state not null default 'open',
  created_at timestamptz not null default now(),
  constraint reports_target_present check (post_id is not null or reported_user_id is not null)
);
create index reports_state_idx on public.reports (state, created_at);

-- Written only by the service role through the moderation route. docs/08 requires
-- 신고/탐지 → 검토 → 근거 확인 → 필요 시 소명 → 조치 → 재검토, so an action row always
-- carries its reason and never results from a single automated signal.
create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action public.moderation_action_type not null,
  post_id uuid references public.confession_posts(id) on delete cascade,
  target_user_id uuid references auth.users(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- community_profiles — the ONLY projection of profiles visible to other users.
-- Nickname + avatar only. church_name / denomination / bio are not selectable
-- through it, satisfying docs/07 "교회명/교단 자동 노출 금지".
-- Owned by postgres so it reads past the owner-only RLS on profiles; that is
-- deliberate and is what keeps the column set narrow.
-- ---------------------------------------------------------------------------

create view public.community_profiles as
  select id, display_name, avatar_path from public.profiles;

revoke all on public.community_profiles from anon;
grant select on public.community_profiles to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.confession_posts enable row level security;

-- Read the public feed: visible posts, minus anyone this user blocked.
create policy "confession_posts_select_visible"
  on public.confession_posts for select to authenticated
  using (
    (hidden_at is null or user_id = auth.uid())
    and not exists (
      select 1 from public.user_blocks b
      where b.blocker_id = auth.uid() and b.blocked_id = confession_posts.user_id
    )
  );

create policy "confession_posts_insert_own"
  on public.confession_posts for insert to authenticated
  with check (auth.uid() = user_id);

create policy "confession_posts_update_own"
  on public.confession_posts for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "confession_posts_delete_own"
  on public.confession_posts for delete to authenticated
  using (auth.uid() = user_id);

-- Comments: readable, but no INSERT/UPDATE policy exists, so the feature is
-- switched off at the database. Re-enabling is an explicit Owner decision.
alter table public.confession_comments enable row level security;
create policy "confession_comments_select_visible"
  on public.confession_comments for select to authenticated
  using (
    deleted_at is null
    and exists (
      select 1 from public.confession_posts p
      where p.id = confession_comments.post_id and p.hidden_at is null
    )
  );

alter table public.confession_reactions enable row level security;
create policy "confession_reactions_select_all"
  on public.confession_reactions for select to authenticated using (true);
create policy "confession_reactions_write_own"
  on public.confession_reactions for insert to authenticated
  with check (auth.uid() = user_id);
create policy "confession_reactions_update_own"
  on public.confession_reactions for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "confession_reactions_delete_own"
  on public.confession_reactions for delete to authenticated
  using (auth.uid() = user_id);

alter table public.post_hashtags enable row level security;
create policy "post_hashtags_select_all"
  on public.post_hashtags for select to authenticated using (true);
create policy "post_hashtags_write_own_post"
  on public.post_hashtags for all to authenticated
  using (
    exists (select 1 from public.confession_posts p
            where p.id = post_hashtags.post_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.confession_posts p
            where p.id = post_hashtags.post_id and p.user_id = auth.uid())
  );

alter table public.user_blocks enable row level security;
create policy "user_blocks_all_own"
  on public.user_blocks for all to authenticated
  using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

alter table public.reports enable row level security;
create policy "reports_insert_own"
  on public.reports for insert to authenticated
  with check (auth.uid() = reporter_id);
create policy "reports_select_own"
  on public.reports for select to authenticated
  using (auth.uid() = reporter_id);

-- No policy at all: moderation_actions is service-role only.
alter table public.moderation_actions enable row level security;
