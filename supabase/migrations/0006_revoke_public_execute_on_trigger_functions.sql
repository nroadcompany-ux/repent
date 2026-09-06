-- RETURN — 0006 Revoke PUBLIC execute on trigger functions
--
-- Postgres grants EXECUTE to PUBLIC on every new function, so revoking from
-- anon/authenticated alone in 0005 left the REST endpoint reachable. These are
-- trigger functions: a trigger fires under the table owner's rights and does
-- not need an EXECUTE grant, so removing PUBLIC costs nothing and closes
-- /rest/v1/rpc for all five.
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.seed_user_defaults() from public;
revoke execute on function public.sync_community_profile() from public;
revoke execute on function public.set_updated_at() from public;
revoke execute on function public.enforce_profile_media_limit() from public;
