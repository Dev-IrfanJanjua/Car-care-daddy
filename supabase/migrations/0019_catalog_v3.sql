-- Step 2 of 2 for the four car types, plus bundles and gallery media.
-- Run AFTER 0018_vehicle_type_enum.sql. Idempotent.
--
-- WHAT THIS DOES
--  1. Prices: your three real tiers become four car types. Hatchback takes the
--     old Compact price, Sedan the old Standard price, SUV the old Large price,
--     and Crossover is priced the same as SUV. The old tier rows are removed.
--  2. Cars: every car is placed in one of Hatchback / Sedan / Crossover / SUV,
--     following the prototype, and ~268 models across 33 brands are added
--     or re-classified so customers rarely hit "car not found".
--  3. Bundles: a new bundles table, seeded with the prototype's three bundles.
--  4. Gallery: items can now be a before/after pair, a video or a photo, and the
--     prototype's items are added.

-- ---------------------------------------------------------------------------
-- 1. Prices
-- ---------------------------------------------------------------------------
insert into public.service_prices (service_id, vehicle_class, base_price)
select sp.service_id,
       case sp.vehicle_class
         when 'compact'  then 'hatchback'::vehicle_class
         when 'standard' then 'sedan'::vehicle_class
         when 'large'    then 'suv'::vehicle_class
       end,
       sp.base_price
  from public.service_prices sp
 where sp.vehicle_class in ('compact', 'standard', 'large')
on conflict (service_id, vehicle_class) do nothing;

insert into public.service_prices (service_id, vehicle_class, base_price)
select sp.service_id, 'crossover'::vehicle_class, sp.base_price
  from public.service_prices sp
 where sp.vehicle_class = 'suv'
on conflict (service_id, vehicle_class) do nothing;

delete from public.service_prices
 where vehicle_class in ('compact', 'standard', 'large', 'coupe', 'van', 'truck', 'luxury');

-- Order as in the prototype: windshield, full glass, headlights, detailing.
update public.services set sort_order = 1 where slug = 'windshield-restoration';
update public.services set sort_order = 2 where slug = 'full-glass-polishing';
update public.services set sort_order = 3 where slug = 'headlight-restoration';
update public.services set sort_order = 4 where slug = 'car-detailing';

-- ---------------------------------------------------------------------------
-- 2. Cars
-- ---------------------------------------------------------------------------
insert into public.vehicle_makes (name) values
  ('Audi'),
  ('BMW'),
  ('BYD'),
  ('Changan'),
  ('Chery'),
  ('Chevrolet'),
  ('DFSK'),
  ('Daihatsu'),
  ('Ford'),
  ('Haval'),
  ('Honda'),
  ('Hyundai'),
  ('Isuzu'),
  ('Jaecoo'),
  ('Jeep'),
  ('KIA'),
  ('Land Rover'),
  ('Lexus'),
  ('MG'),
  ('Mazda'),
  ('Mercedes-Benz'),
  ('Mitsubishi'),
  ('Nissan'),
  ('Peugeot'),
  ('Porsche'),
  ('Prince'),
  ('Proton'),
  ('Range Rover'),
  ('Subaru'),
  ('Suzuki'),
  ('Toyota'),
  ('United'),
  ('Volkswagen')
on conflict (name) do nothing;

-- Anything not named below still gets folded into the nearest of the four.
update public.vehicle_models set vehicle_class = 'hatchback' where vehicle_class = 'compact';
update public.vehicle_models set vehicle_class = 'sedan'     where vehicle_class in ('standard', 'coupe');
update public.vehicle_models set vehicle_class = 'suv'       where vehicle_class in ('large', 'van', 'truck', 'luxury');

insert into public.vehicle_models (make_id, name, vehicle_class)
select m.id, v.name, v.vehicle_class::vehicle_class
from (values
  ('Suzuki', 'Mehran', 'hatchback'),
  ('Suzuki', 'Alto', 'hatchback'),
  ('Suzuki', 'Cultus', 'hatchback'),
  ('Suzuki', 'Old Cultus', 'hatchback'),
  ('Suzuki', 'Wagon R', 'hatchback'),
  ('Suzuki', 'Swift', 'hatchback'),
  ('Suzuki', 'Every', 'hatchback'),
  ('Suzuki', 'Bolan', 'hatchback'),
  ('Suzuki', 'Khyber', 'hatchback'),
  ('Suzuki', 'Ravi', 'hatchback'),
  ('Suzuki', 'Baleno', 'hatchback'),
  ('Suzuki', 'Liana', 'hatchback'),
  ('Suzuki', 'Celerio', 'hatchback'),
  ('Suzuki', 'S-Presso', 'hatchback'),
  ('Suzuki', 'Ignis', 'hatchback'),
  ('Suzuki', 'Spacia', 'hatchback'),
  ('Suzuki', 'Hustler', 'hatchback'),
  ('Suzuki', 'Solio', 'hatchback'),
  ('Suzuki', 'Alto Lapin', 'hatchback'),
  ('Suzuki', 'APV', 'hatchback'),
  ('Suzuki', 'Ciaz', 'sedan'),
  ('Suzuki', 'Kizashi', 'sedan'),
  ('Suzuki', 'Vitara', 'crossover'),
  ('Suzuki', 'Jimny', 'suv'),
  ('Daihatsu', 'Cuore', 'hatchback'),
  ('Daihatsu', 'Mira', 'hatchback'),
  ('Daihatsu', 'Move', 'hatchback'),
  ('Daihatsu', 'Mira Cocoa', 'hatchback'),
  ('Daihatsu', 'Tanto', 'hatchback'),
  ('Daihatsu', 'Naked', 'hatchback'),
  ('Daihatsu', 'Copen', 'hatchback'),
  ('Daihatsu', 'Boon', 'hatchback'),
  ('Daihatsu', 'Terios', 'crossover'),
  ('Daihatsu', 'Rocky', 'crossover'),
  ('Toyota', 'Vitz', 'hatchback'),
  ('Toyota', 'Passo', 'hatchback'),
  ('Toyota', 'Aqua', 'hatchback'),
  ('Toyota', 'Pixis', 'hatchback'),
  ('Toyota', 'Yaris Hatchback', 'hatchback'),
  ('Toyota', 'Auris', 'hatchback'),
  ('Toyota', 'Ractis', 'hatchback'),
  ('Toyota', 'Spade', 'hatchback'),
  ('Toyota', 'Porte', 'hatchback'),
  ('Toyota', 'Roomy', 'hatchback'),
  ('Toyota', 'Corolla', 'sedan'),
  ('Toyota', 'Yaris', 'sedan'),
  ('Toyota', 'Camry', 'sedan'),
  ('Toyota', 'Premio', 'sedan'),
  ('Toyota', 'Allion', 'sedan'),
  ('Toyota', 'Prius', 'sedan'),
  ('Toyota', 'Fielder', 'sedan'),
  ('Toyota', 'Axio', 'sedan'),
  ('Toyota', 'Belta', 'sedan'),
  ('Toyota', 'Crown', 'sedan'),
  ('Toyota', 'Mark X', 'sedan'),
  ('Toyota', 'Corolla Cross', 'crossover'),
  ('Toyota', 'Raize', 'crossover'),
  ('Toyota', 'Yaris Cross', 'crossover'),
  ('Toyota', 'C-HR', 'crossover'),
  ('Toyota', 'Rush', 'crossover'),
  ('Toyota', 'Sienta', 'crossover'),
  ('Toyota', 'Harrier', 'crossover'),
  ('Toyota', 'Vanguard', 'crossover'),
  ('Toyota', 'Fortuner', 'suv'),
  ('Toyota', 'Land Cruiser', 'suv'),
  ('Toyota', 'Land Cruiser 300', 'suv'),
  ('Toyota', 'Prado', 'suv'),
  ('Toyota', 'Hilux', 'suv'),
  ('Toyota', 'Hilux Revo', 'suv'),
  ('Toyota', 'Revo', 'suv'),
  ('Toyota', 'Hilux Vigo', 'suv'),
  ('Toyota', 'Rav4', 'suv'),
  ('Toyota', 'RAV4', 'suv'),
  ('Toyota', 'Hiace', 'suv'),
  ('Toyota', 'Highlander', 'suv'),
  ('Toyota', 'Tacoma', 'suv'),
  ('Toyota', 'Sienna', 'suv'),
  ('Honda', 'Fit', 'hatchback'),
  ('Honda', 'N-WGN', 'hatchback'),
  ('Honda', 'N-One', 'hatchback'),
  ('Honda', 'N-Box', 'hatchback'),
  ('Honda', 'N-Van', 'hatchback'),
  ('Honda', 'Life', 'hatchback'),
  ('Honda', 'Jazz', 'hatchback'),
  ('Honda', 'Insight', 'hatchback'),
  ('Honda', 'City', 'sedan'),
  ('Honda', 'Civic', 'sedan'),
  ('Honda', 'Civic Reborn', 'sedan'),
  ('Honda', 'Grace', 'sedan'),
  ('Honda', 'Accord', 'sedan'),
  ('Honda', 'Shuttle', 'sedan'),
  ('Honda', 'Airwave', 'sedan'),
  ('Honda', 'HR-V', 'crossover'),
  ('Honda', 'BR-V', 'crossover'),
  ('Honda', 'Vezel', 'crossover'),
  ('Honda', 'CR-V', 'crossover'),
  ('Honda', 'Freed', 'crossover'),
  ('Honda', 'Stepwgn', 'suv'),
  ('Honda', 'Odyssey', 'suv'),
  ('Honda', 'Ridgeline', 'suv'),
  ('Nissan', 'Dayz', 'hatchback'),
  ('Nissan', 'Moco', 'hatchback'),
  ('Nissan', 'Roox', 'hatchback'),
  ('Nissan', 'Clipper', 'hatchback'),
  ('Nissan', 'Note', 'hatchback'),
  ('Nissan', 'March', 'hatchback'),
  ('Nissan', 'Sunny', 'sedan'),
  ('Nissan', 'Sylphy', 'sedan'),
  ('Nissan', 'Altima', 'sedan'),
  ('Nissan', 'Sentra', 'sedan'),
  ('Nissan', 'Juke', 'crossover'),
  ('Nissan', 'X-Trail', 'crossover'),
  ('Nissan', 'Kicks', 'crossover'),
  ('Nissan', 'Murano', 'crossover'),
  ('Nissan', 'Rogue', 'crossover'),
  ('Nissan', 'Patrol', 'suv'),
  ('Nissan', 'Frontier', 'suv'),
  ('Nissan', 'Navara', 'suv'),
  ('Hyundai', 'Santro', 'hatchback'),
  ('Hyundai', 'i10', 'hatchback'),
  ('Hyundai', 'i20', 'hatchback'),
  ('Hyundai', 'Elantra', 'sedan'),
  ('Hyundai', 'Sonata', 'sedan'),
  ('Hyundai', 'Accent', 'sedan'),
  ('Hyundai', 'Tucson', 'crossover'),
  ('Hyundai', 'Creta', 'crossover'),
  ('Hyundai', 'Venue', 'crossover'),
  ('Hyundai', 'Kona', 'crossover'),
  ('Hyundai', 'Santa Fe', 'suv'),
  ('Hyundai', 'Palisade', 'suv'),
  ('Hyundai', 'Grand Starex', 'suv'),
  ('Hyundai', 'Staria', 'suv'),
  ('KIA', 'Picanto', 'hatchback'),
  ('KIA', 'Rio', 'sedan'),
  ('KIA', 'Cerato', 'sedan'),
  ('KIA', 'Stinger', 'sedan'),
  ('KIA', 'Sportage', 'crossover'),
  ('KIA', 'Sportage L', 'crossover'),
  ('KIA', 'Stonic', 'crossover'),
  ('KIA', 'Seltos', 'crossover'),
  ('KIA', 'Soul', 'crossover'),
  ('KIA', 'Niro', 'crossover'),
  ('KIA', 'EV6', 'crossover'),
  ('KIA', 'Sorento', 'suv'),
  ('KIA', 'Carnival', 'suv'),
  ('KIA', 'EV9', 'suv'),
  ('MG', 'MG 4', 'hatchback'),
  ('MG', 'MG 3', 'hatchback'),
  ('MG', '5', 'sedan'),
  ('MG', 'MG 5', 'sedan'),
  ('MG', 'GT', 'sedan'),
  ('MG', 'Cyberster', 'sedan'),
  ('MG', 'HS', 'crossover'),
  ('MG', 'ZS', 'crossover'),
  ('MG', 'RX5', 'crossover'),
  ('MG', 'Marvel R', 'crossover'),
  ('Changan', 'Karvaan', 'hatchback'),
  ('Changan', 'Alsvin', 'sedan'),
  ('Changan', 'Eado', 'sedan'),
  ('Changan', 'Oshan X7', 'crossover'),
  ('Changan', 'Uni-T', 'crossover'),
  ('Changan', 'Uni-K', 'crossover'),
  ('Changan', 'CS35', 'crossover'),
  ('Changan', 'M9', 'suv'),
  ('Haval', 'H6', 'crossover'),
  ('Haval', 'H6 HEV', 'crossover'),
  ('Haval', 'Jolion', 'crossover'),
  ('Haval', 'Dargo', 'crossover'),
  ('Haval', 'H9', 'suv'),
  ('Proton', 'Saga', 'sedan'),
  ('Proton', 'Persona', 'sedan'),
  ('Proton', 'Preve', 'sedan'),
  ('Proton', 'X70', 'crossover'),
  ('Proton', 'X50', 'crossover'),
  ('Chery', 'Arrizo 5', 'sedan'),
  ('Chery', 'Tiggo 4 Pro', 'crossover'),
  ('Chery', 'Tiggo 7', 'crossover'),
  ('Chery', 'Tiggo 8', 'crossover'),
  ('BYD', 'Dolphin', 'hatchback'),
  ('BYD', 'Seal', 'sedan'),
  ('BYD', 'Han', 'sedan'),
  ('BYD', 'Atto 3', 'crossover'),
  ('BYD', 'Sealion', 'crossover'),
  ('BYD', 'Tang', 'suv'),
  ('Jaecoo', 'J5', 'crossover'),
  ('Jaecoo', 'J7', 'crossover'),
  ('Jaecoo', 'J8', 'suv'),
  ('Audi', 'A3', 'sedan'),
  ('Audi', 'A4', 'sedan'),
  ('Audi', 'A5', 'sedan'),
  ('Audi', 'A6', 'sedan'),
  ('Audi', 'A7', 'sedan'),
  ('Audi', 'A8', 'sedan'),
  ('Audi', 'Q3', 'crossover'),
  ('Audi', 'Q5', 'crossover'),
  ('Audi', 'e-tron', 'crossover'),
  ('Audi', 'Q7', 'suv'),
  ('Audi', 'Q8', 'suv'),
  ('BMW', '3 Series', 'sedan'),
  ('BMW', '5 Series', 'sedan'),
  ('BMW', '7 Series', 'sedan'),
  ('BMW', 'X1', 'crossover'),
  ('BMW', 'X3', 'crossover'),
  ('BMW', 'X5', 'suv'),
  ('BMW', 'X7', 'suv'),
  ('Mercedes-Benz', 'A-Class', 'sedan'),
  ('Mercedes-Benz', 'C-Class', 'sedan'),
  ('Mercedes-Benz', 'E-Class', 'sedan'),
  ('Mercedes-Benz', 'S-Class', 'sedan'),
  ('Mercedes-Benz', 'CLA', 'sedan'),
  ('Mercedes-Benz', 'GLA', 'crossover'),
  ('Mercedes-Benz', 'GLC', 'crossover'),
  ('Mercedes-Benz', 'GLE', 'suv'),
  ('Mercedes-Benz', 'GLS', 'suv'),
  ('Mercedes-Benz', 'G-Class', 'suv'),
  ('Lexus', 'IS', 'sedan'),
  ('Lexus', 'ES', 'sedan'),
  ('Lexus', 'NX', 'crossover'),
  ('Lexus', 'RX', 'crossover'),
  ('Lexus', 'LX', 'suv'),
  ('Range Rover', 'Evoque', 'crossover'),
  ('Range Rover', 'Velar', 'crossover'),
  ('Range Rover', 'Sport', 'suv'),
  ('Range Rover', 'Range Rover', 'suv'),
  ('Land Rover', 'Range Rover', 'suv'),
  ('Land Rover', 'Defender', 'suv'),
  ('Land Rover', 'Discovery', 'suv'),
  ('Porsche', 'Macan', 'crossover'),
  ('Porsche', 'Panamera', 'sedan'),
  ('Porsche', 'Cayenne', 'suv'),
  ('Jeep', 'Compass', 'crossover'),
  ('Jeep', 'Wrangler', 'suv'),
  ('Jeep', 'Grand Cherokee', 'suv'),
  ('Ford', 'Escape', 'crossover'),
  ('Ford', 'Mustang', 'sedan'),
  ('Ford', 'Explorer', 'suv'),
  ('Ford', 'F-150', 'suv'),
  ('Ford', 'Ranger', 'suv'),
  ('Ford', 'Transit', 'suv'),
  ('Chevrolet', 'Equinox', 'crossover'),
  ('Chevrolet', 'Malibu', 'sedan'),
  ('Chevrolet', 'Silverado', 'suv'),
  ('Chevrolet', 'Suburban', 'suv'),
  ('Mitsubishi', 'Mirage', 'hatchback'),
  ('Mitsubishi', 'Lancer', 'sedan'),
  ('Mitsubishi', 'Outlander', 'crossover'),
  ('Mitsubishi', 'ASX', 'crossover'),
  ('Mitsubishi', 'Pajero', 'suv'),
  ('Mitsubishi', 'Montero', 'suv'),
  ('Mitsubishi', 'L200', 'suv'),
  ('Isuzu', 'D-Max', 'suv'),
  ('Isuzu', 'MU-X', 'suv'),
  ('Peugeot', '208', 'hatchback'),
  ('Peugeot', '508', 'sedan'),
  ('Peugeot', '2008', 'crossover'),
  ('Peugeot', '3008', 'crossover'),
  ('DFSK', 'Glory 580', 'crossover'),
  ('DFSK', 'Glory i-Auto', 'crossover'),
  ('United', 'Bravo', 'hatchback'),
  ('Prince', 'Pearl', 'hatchback'),
  ('Volkswagen', 'Golf', 'hatchback'),
  ('Volkswagen', 'Passat', 'sedan'),
  ('Volkswagen', 'Tiguan', 'crossover'),
  ('Mazda', 'Mazda 3', 'sedan'),
  ('Mazda', 'CX-5', 'crossover'),
  ('Subaru', 'Impreza', 'sedan'),
  ('Subaru', 'XV', 'crossover'),
  ('Subaru', 'Forester', 'crossover')
) as v(brand_name, name, vehicle_class)
join public.vehicle_makes m on m.name = v.brand_name
on conflict (make_id, name) do update set vehicle_class = excluded.vehicle_class;

-- ---------------------------------------------------------------------------
-- 3. Bundles
-- ---------------------------------------------------------------------------
-- A bundle is a set of services sold together at a percentage off. Its price is
-- worked out from the services' own prices for the customer's car type, so a
-- price change on a service flows into the bundle automatically.
create table if not exists public.bundles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  badge text,
  description text,
  discount_percent int not null default 0 check (discount_percent between 0 and 60),
  service_ids uuid[] not null default '{}',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.bundles enable row level security;

drop policy if exists "bundles_public_read" on public.bundles;
create policy "bundles_public_read" on public.bundles
  for select using (is_active or public.is_admin());

drop policy if exists "bundles_admin_write" on public.bundles;
create policy "bundles_admin_write" on public.bundles
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.bundles (slug, name, badge, description, discount_percent, service_ids, sort_order)
select b.slug, b.name, b.badge, b.description, b.discount,
       array(select s.id from public.services s where s.slug = any (b.items)
             order by s.sort_order),
       b.sort
  from (values
    ('clear-vision', 'Clear Vision', 'Save 10%',
     'Windshield restoration plus headlight restoration — the essential front-end combo for night and rainy-season driving.',
     10, array['windshield-restoration', 'headlight-restoration'], 1),
    ('full-glass-headlights', 'Full Glass + Headlights', 'Best value',
     'Every window polished and both headlights restored, in one doorstep visit.',
     12, array['full-glass-polishing', 'headlight-restoration'], 2),
    ('complete-care', 'Complete Care', 'Ultimate',
     'Full glass polishing, headlight restoration and a complete interior and exterior detail — the showroom reset.',
     15, array['full-glass-polishing', 'headlight-restoration', 'car-detailing'], 3)
  ) as b(slug, name, badge, description, discount, items, sort)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 4. Gallery: photos and videos as well as before/after pairs
-- ---------------------------------------------------------------------------
alter table public.gallery_items
  add column if not exists kind text not null default 'compare',
  add column if not exists media_url text,
  add column if not exists poster_url text;

alter table public.gallery_items drop constraint if exists gallery_items_kind_check;
alter table public.gallery_items
  add constraint gallery_items_kind_check check (kind in ('compare', 'video', 'image'));

alter table public.gallery_items alter column before_url drop not null;
alter table public.gallery_items alter column after_url drop not null;

-- The prototype's items. The first three are featured, so they make up the home
-- page slider. Skipped for any title that already exists, so re-running (or an
-- upload of your own) never duplicates them. Newest first = the order shown.
insert into public.gallery_items (title, service, kind, before_url, after_url, media_url, poster_url, is_featured, created_at)
select v.title, v.service, v.kind, v.before_url, v.after_url, v.media_url, v.poster_url, v.featured,
       now() - (v.n || ' minutes')::interval
  from (values
    (1, 'Windshield restoration', 'Windshield', 'compare', '/images/before-windshield.jpg', '/images/after-windshield.jpg', null, null, true),
    (2, 'The Car Aurum touch', 'Detailing', 'video', null, null, '/videos/video1.mp4', '/images/gallery/video1-poster.jpg', true),
    (3, 'Night-ready headlights & glass', 'Headlights', 'video', null, null, '/videos/video2.mp4', '/images/gallery/video2-poster.jpg', true),
    (4, 'Headlight clarity', 'Headlights', 'image', null, null, '/images/gallery/gallery-e.jpg', null, false),
    (5, 'Quarter-glass polish', 'Glass', 'image', null, null, '/images/gallery/gallery-c.jpg', null, false),
    (6, 'Full detail finish', 'Detailing', 'image', null, null, '/images/gallery/gallery-d.jpg', null, false),
    (7, 'Interior clarity through glass', 'Glass', 'image', null, null, '/images/gallery/gallery-b.jpg', null, false),
    (8, 'Restored side glass', 'Glass', 'image', null, null, '/images/gallery/gallery-a.jpg', null, false),
    (9, 'Clear windshield, clean cabin', 'Windshield', 'image', null, null, '/images/gallery/gallery-g.jpg', null, false)
  ) as v(n, title, service, kind, before_url, after_url, media_url, poster_url, featured)
 where not exists (select 1 from public.gallery_items g where g.title = v.title);
