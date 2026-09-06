-- RETURN — 0008 Journey birth-date anchor
-- Owner decision 2026-09-06: the member's birth date is the first Journey
-- timeline anchor. profiles.created_at remains the reliable RETURN start anchor.

alter table public.profiles
  add column if not exists birth_date date;

alter table public.profiles
  add constraint profiles_birth_date_not_future
  check (birth_date is null or birth_date <= current_date);
