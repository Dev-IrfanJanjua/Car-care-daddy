-- Car Care: RLS policies
-- All writes for guest/customer-originated data (leads, quotes, bookings, booking_services, photos)
-- go through Server Actions using the service-role key, which bypasses RLS entirely.
-- No anon/authenticated INSERT policies are granted on those tables on purpose.

create function public.is_admin()
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

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.vehicle_makes enable row level security;
alter table public.vehicle_models enable row level security;
alter table public.services enable row level security;
alter table public.service_prices enable row level security;
alter table public.quotes enable row level security;
alter table public.leads enable row level security;
alter table public.technicians enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_services enable row level security;
alter table public.partners enable row level security;
alter table public.business_settings enable row level security;
alter table public.reviews enable row level security;
alter table public.photos enable row level security;
alter table public.insurance_claims enable row level security;

-- profiles: self or admin. Role changes are never exposed in the client
-- update form (app-layer rule) -- not enforced via a column-level RLS trick.
create policy "profiles_select_self_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles_update_self_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- catalog data: public read, admin write
create policy "vehicle_makes_public_read" on public.vehicle_makes
  for select using (true);
create policy "vehicle_makes_admin_write" on public.vehicle_makes
  for all using (public.is_admin()) with check (public.is_admin());

create policy "vehicle_models_public_read" on public.vehicle_models
  for select using (true);
create policy "vehicle_models_admin_write" on public.vehicle_models
  for all using (public.is_admin()) with check (public.is_admin());

create policy "services_public_read" on public.services
  for select using (is_active or public.is_admin());
create policy "services_admin_write" on public.services
  for all using (public.is_admin()) with check (public.is_admin());

create policy "service_prices_public_read" on public.service_prices
  for select using (true);
create policy "service_prices_admin_write" on public.service_prices
  for all using (public.is_admin()) with check (public.is_admin());

-- quotes: customer sees own, admin sees all. No client-side inserts (Server Action + service role only).
create policy "quotes_select_self_or_admin" on public.quotes
  for select using (customer_id = auth.uid() or public.is_admin());
create policy "quotes_admin_write" on public.quotes
  for update using (public.is_admin()) with check (public.is_admin());

-- leads: admin only
create policy "leads_admin_all" on public.leads
  for all using (public.is_admin()) with check (public.is_admin());

-- technicians: admin only, never exposed directly to customers
create policy "technicians_admin_all" on public.technicians
  for all using (public.is_admin()) with check (public.is_admin());

-- bookings: customer sees own, admin sees/manages all
create policy "bookings_select_self_or_admin" on public.bookings
  for select using (customer_id = auth.uid() or public.is_admin());
create policy "bookings_admin_write" on public.bookings
  for update using (public.is_admin()) with check (public.is_admin());

create policy "booking_services_select_self_or_admin" on public.booking_services
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.bookings b
      where b.id = booking_services.booking_id and b.customer_id = auth.uid()
    )
  );

-- partners, business_settings, insurance_claims: admin only
create policy "partners_admin_all" on public.partners
  for all using (public.is_admin()) with check (public.is_admin());

create policy "business_settings_public_read" on public.business_settings
  for select using (true);
create policy "business_settings_admin_write" on public.business_settings
  for all using (public.is_admin()) with check (public.is_admin());

create policy "insurance_claims_admin_all" on public.insurance_claims
  for all using (public.is_admin()) with check (public.is_admin());

-- reviews: public testimonials + admin moderation. Inserts via Server Action (service role) only.
create policy "reviews_public_read" on public.reviews
  for select using (is_public or public.is_admin());
create policy "reviews_admin_write" on public.reviews
  for update using (public.is_admin()) with check (public.is_admin());

-- photos: admin only visibility (customers get their own copy via the success page at upload time)
create policy "photos_admin_read" on public.photos
  for select using (public.is_admin());
