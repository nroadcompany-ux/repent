-- RETURN — 0009 Promise recurrence
-- Owner decision 2026-09-06: a promise is the executable item itself. New
-- promises can repeat daily/weekly/monthly/yearly without creating a duplicate
-- Action sentence. Existing rows default to their current one-off behaviour.

alter table public.promises
  add column if not exists repeat_type text not null default 'none',
  add column if not exists repeat_weekdays smallint[] not null default '{}';

alter table public.promises
  add constraint promises_repeat_type_check
  check (repeat_type in ('none', 'daily', 'weekly', 'monthly', 'yearly'));

alter table public.promises
  add constraint promises_repeat_weekdays_check
  check (
    repeat_weekdays <@ array[0,1,2,3,4,5,6]::smallint[]
  );
