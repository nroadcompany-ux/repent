-- RETURN — 0007 Confession Comment = MVP INCLUDED
--
-- Owner Final Decision (2026-09-06): Comment is in the Confession MVP, not on
-- HOLD. This restores the canonical position in docs/04 and AC-06
-- ("MVP에 Photo와 Comment가 포함된다") which 0003 had left switched off.
--
-- Nothing here invents Product Meaning. Every capability below is named in
-- docs/08 Comment Safety:
--   작성자 본인 삭제 / 신고 / 사용자 Block / 운영자 Hide·Delete
-- and the read path keeps the same block-aware visibility rule the feed uses.

-- ---------------------------------------------------------------------------
-- 1. Reads: hide comments from members this user blocked.
--    Replaces the 0003 policy, which only checked the parent post.
-- ---------------------------------------------------------------------------

drop policy if exists "confession_comments_select_visible" on public.confession_comments;

create policy "confession_comments_select_visible"
  on public.confession_comments for select to authenticated
  using (
    deleted_at is null
    and exists (
      select 1 from public.confession_posts p
      where p.id = confession_comments.post_id and p.hidden_at is null
    )
    and not exists (
      select 1 from public.user_blocks b
      where b.blocker_id = auth.uid() and b.blocked_id = confession_comments.user_id
    )
  );

-- ---------------------------------------------------------------------------
-- 2. Write: a member may comment as themselves, on a post that is visible.
-- ---------------------------------------------------------------------------

create policy "confession_comments_insert_own"
  on public.confession_comments for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.confession_posts p
      where p.id = confession_comments.post_id and p.hidden_at is null
    )
  );

-- docs/08 names 작성자 본인 삭제 explicitly. Deletion is a soft delete so the
-- thread keeps its shape and a moderator can still review what happened.
create policy "confession_comments_update_own"
  on public.confession_comments for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "confession_comments_delete_own"
  on public.confession_comments for delete to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. Reporting a comment (docs/08 Comment Safety lists 신고).
--    `reports` already carries post_id and reported_user_id; a comment target
--    needs its own column rather than being squeezed into post_id.
-- ---------------------------------------------------------------------------

alter table public.reports
  add column if not exists comment_id uuid references public.confession_comments(id) on delete cascade;

alter table public.reports drop constraint if exists reports_target_present;
alter table public.reports add constraint reports_target_present
  check (post_id is not null or comment_id is not null or reported_user_id is not null);

-- Moderator Hide/Delete on a comment is recorded the same way as on a post.
alter table public.moderation_actions
  add column if not exists comment_id uuid references public.confession_comments(id) on delete cascade;

-- ---------------------------------------------------------------------------
-- 4. Index for reading a thread and counting comments per post.
--    The 0003 index covers (post_id, created_at); add a partial one so the
--    feed's visible-count query does not scan soft-deleted rows.
-- ---------------------------------------------------------------------------

create index if not exists confession_comments_visible_idx
  on public.confession_comments (post_id, created_at)
  where deleted_at is null;
