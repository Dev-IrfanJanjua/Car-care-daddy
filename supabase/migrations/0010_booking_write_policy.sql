-- Repair the admin write policy on bookings.
--
-- Symptom: an admin changes a booking's status in /admin/bookings/[id], the UI
-- reports success, and the row is still 'pending' on reload. Every booking in
-- the database was still 'pending' despite repeated attempts.
--
-- Cause: an UPDATE that RLS filters out is not an error. PostgREST returns 200
-- with zero rows affected, so the action saw no error and reported success.
-- Reads worked (the bookings list renders), so is_admin() resolves correctly
-- for SELECT -- which points at the UPDATE policy specifically being absent or
-- differing from what 0002 declares.
--
-- Idempotent: drops and recreates, so it is safe whether the policy is missing,
-- present, or wrong. lib/actions/admin/bookings.ts now also asserts a row came
-- back, so this can never fail silently again.

-- is_admin() is the predicate both policies depend on. Recreated here so this
-- migration stands alone if 0002 was only partially applied. SECURITY DEFINER
-- so it can read profiles without recursing through that table's own policies.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.bookings enable row level security;

drop policy if exists "bookings_admin_write" on public.bookings;
create policy "bookings_admin_write" on public.bookings
  for update using (public.is_admin()) with check (public.is_admin());

-- The read side, restated for the same reason.
drop policy if exists "bookings_select_self_or_admin" on public.bookings;
create policy "bookings_select_self_or_admin" on public.bookings
  for select using (customer_id = auth.uid() or public.is_admin());
