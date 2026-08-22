-- Car Care: security hardening
-- Run after 0004_storage.sql. Addresses three issues found in review:
--   1. Any signed-in user could promote themselves to admin.
--   2. Guest booking pages leaked PII to anyone holding the booking UUID.
--   3. Reviews auto-published to the public homepage, unlimited per booking.

-- ---------------------------------------------------------------------------
-- 1. Role self-escalation guard
-- ---------------------------------------------------------------------------
-- profiles_update_self_or_admin (0002) permits `id = auth.uid()` with no column
-- restriction, so a customer could run `update profiles set role='admin'` on
-- their own row using only the public anon key. RLS can't compare OLD vs NEW,
-- so the column-level rule has to live in a trigger.
--
-- The `auth.uid() is not null` clause deliberately exempts contexts with no
-- authenticated user -- the service-role client and the dashboard SQL editor.
-- Those are already fully trusted (service role bypasses RLS entirely), and
-- the documented way to create the first admin is a manual SQL update, which
-- this must not break.

create function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'role changes require admin privileges';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

-- ---------------------------------------------------------------------------
-- 2. Per-booking access token for guest-facing pages
-- ---------------------------------------------------------------------------
-- /book/success/[id] and /review/[id] read bookings with the service-role
-- client (a guest has no session, so RLS would hide their own booking). They
-- were gated only by knowledge of the UUID: no expiry, permanent access to
-- name, email, phone, and street address. Requiring a second unguessable
-- value means a leaked booking id alone is no longer enough.

alter table public.bookings
  add column access_token uuid not null default gen_random_uuid();

-- ---------------------------------------------------------------------------
-- 3. Review integrity
-- ---------------------------------------------------------------------------
-- Reviews were insertable once per request with is_public defaulting to true,
-- so anyone holding a completed booking's id could publish unlimited
-- testimonials straight onto the homepage. One review per booking, held for
-- moderation by default.

alter table public.reviews
  add constraint reviews_one_per_booking unique (booking_id);

alter table public.reviews
  alter column is_public set default false;
