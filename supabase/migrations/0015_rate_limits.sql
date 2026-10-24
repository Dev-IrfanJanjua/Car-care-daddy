-- 0015: abuse protection for public forms (booking, unlisted-vehicle lead,
-- review, staff sign-in). Safe to re-run.

create table if not exists public.rate_limits (
  key text primary key,
  hits int not null default 0,
  window_start timestamptz not null default now()
);

-- No policies on purpose: with RLS on and nothing granted, only the service
-- role (used by our server actions) can touch it.
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

-- Atomically counts a hit and reports whether it is still within the limit.
create or replace function public.check_rate_limit(p_key text, p_max int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hits int;
begin
  insert into public.rate_limits as r (key, hits, window_start)
  values (p_key, 1, now())
  on conflict (key) do update
    set hits = case
                 when r.window_start < now() - make_interval(secs => p_window_seconds) then 1
                 else r.hits + 1
               end,
        window_start = case
                 when r.window_start < now() - make_interval(secs => p_window_seconds) then now()
                 else r.window_start
               end
  returning hits into v_hits;

  return v_hits <= p_max;
end;
$$;

revoke all on function public.check_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, int, int) to service_role;

-- Housekeeping, called from the daily cron.
create or replace function public.purge_rate_limits()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.rate_limits where window_start < now() - interval '2 days';
$$;

revoke all on function public.purge_rate_limits() from public, anon, authenticated;
grant execute on function public.purge_rate_limits() to service_role;
