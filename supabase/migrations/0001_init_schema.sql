-- Car Care: initial schema
create extension if not exists pgcrypto;

create type user_role as enum ('customer', 'admin');
create type vehicle_class as enum ('sedan', 'suv', 'truck', 'van', 'coupe', 'luxury');
create type quote_status as enum ('active', 'expired', 'booked');
create type lead_status as enum ('new', 'contacted', 'converted', 'lost');
create type booking_status as enum ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
create type technician_status as enum ('active', 'inactive', 'on_leave');
create type partner_type as enum ('insurance', 'dealership', 'fleet', 'referral');

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles: extends auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'customer',
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

-- vehicle catalog
create table public.vehicle_makes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table public.vehicle_models (
  id uuid primary key default gen_random_uuid(),
  make_id uuid not null references public.vehicle_makes(id) on delete cascade,
  name text not null,
  vehicle_class vehicle_class not null,
  unique (make_id, name)
);

-- service catalog + pricing matrix
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category text,
  is_active boolean not null default true,
  sort_order int not null default 0
);

create table public.service_prices (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  vehicle_class vehicle_class not null,
  base_price numeric(10, 2) not null,
  unique (service_id, vehicle_class)
);

-- quotes (guest-friendly, snapshot pricing)
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_id uuid references public.profiles(id) on delete set null,
  lead_id uuid,
  vehicle_make text not null,
  vehicle_model text not null,
  vehicle_year int not null,
  vehicle_class vehicle_class not null,
  line_items jsonb not null default '[]',
  subtotal numeric(10, 2) not null default 0,
  discount numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  expires_at timestamptz not null default (now() + interval '7 days'),
  status quote_status not null default 'active'
);

-- leads: partial contact capture from abandoned quote flows
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text,
  email text,
  phone text,
  vehicle_make text,
  vehicle_model text,
  vehicle_year int,
  service_ids uuid[],
  quote_total numeric(10, 2),
  status lead_status not null default 'new',
  converted_booking_id uuid,
  source text
);

-- technicians (no portal login in v1)
create table public.technicians (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  photo_url text,
  status technician_status not null default 'active',
  skills text[]
);

-- bookings
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  quote_id uuid references public.quotes(id) on delete set null,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  vehicle_make text not null,
  vehicle_model text not null,
  vehicle_year int not null,
  vehicle_class vehicle_class not null,
  service_address text not null,
  service_city text not null,
  service_zip text not null,
  scheduled_at timestamptz not null,
  status booking_status not null default 'pending',
  assigned_technician_id uuid references public.technicians(id) on delete set null,
  total_amount numeric(10, 2) not null default 0,
  deposit_amount numeric(10, 2),
  deposit_paid boolean not null default false,
  notes text
);

alter table public.leads
  add constraint leads_converted_booking_id_fkey
  foreign key (converted_booking_id) references public.bookings(id) on delete set null;

create table public.booking_services (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  price numeric(10, 2) not null
);

-- partners (insurance/dealership/fleet/referral)
create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type partner_type not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  commission_rate numeric(5, 2),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- singleton business settings row
create table public.business_settings (
  id boolean primary key default true,
  business_name text not null default 'Car Care',
  contact_email text,
  contact_phone text,
  hours jsonb,
  service_area jsonb,
  constraint business_settings_singleton check (id)
);

-- beyond-parity: reviews, photos, insurance claims (schema now, UI phased in later)
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid references public.quotes(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table public.insurance_claims (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  insurance_provider text not null,
  policy_number text,
  claim_number text,
  status text not null default 'new',
  notes text,
  created_at timestamptz not null default now()
);

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

create index bookings_scheduled_at_idx on public.bookings (scheduled_at);
create index bookings_status_idx on public.bookings (status);
create index bookings_assigned_technician_idx on public.bookings (assigned_technician_id);
create index leads_status_idx on public.leads (status);
create index vehicle_models_make_idx on public.vehicle_models (make_id);
create index service_prices_service_idx on public.service_prices (service_id);
