-- RETURN — 0010 Confession simple reactions
-- Owner decision 2026-09-06: user-facing reactions are 👍 좋아요 / 👎 싫어요.
-- Existing semantic reaction enum values remain for historical rows and safe
-- rollback. The new feed ignores those legacy values; no destructive migration.

alter type public.reaction_type add value if not exists 'like';
alter type public.reaction_type add value if not exists 'dislike';
