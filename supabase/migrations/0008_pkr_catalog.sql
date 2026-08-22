-- Car Care Daddy: real service catalog, vehicle catalog and PKR pricing.
-- Run AFTER 0007_pkr_price_tiers.sql (the new enum values must already exist).
--
-- Prices are PKR, stored as plain numerics in service_prices.base_price -- the
-- same column the old USD figures used. Nothing in the schema encodes a
-- currency; formatting lives in lib/format.ts.
--
-- Safe to run against the current database: there are no bookings and no
-- booking_services rows, so removing the seeded demo services violates no
-- ON DELETE RESTRICT foreign key.

-- ---------------------------------------------------------------------------
-- 1. Services
-- ---------------------------------------------------------------------------
-- Replaces the eight seeded US auto-glass services. service_prices rows are
-- removed by ON DELETE CASCADE.
delete from public.services;

insert into public.services (name, slug, description, category, sort_order, is_active) values
  ('Windshield Restoration', 'windshield-restoration',
   'Professional CeO2 treatment that removes water spots, mineral stains, wiper marks and light scratches, cuts night glare, and restores clarity. 3-year results warranty.',
   'windshield', 1, true),
  ('Full Glass Polishing', 'full-glass-polishing',
   'Professional machine polishing across all the car''s glass to lift surface marks and stains and improve overall clarity.',
   'glass', 2, true),
  ('Headlight Restoration', 'headlight-restoration',
   'Removes yellowing, oxidation and cloudiness to restore headlight clarity and improve light output.',
   'headlights', 3, false),
  ('Car Detailing', 'car-detailing',
   'Complete interior and exterior cleaning and detailing for a fresh, premium finish.',
   'detailing', 4, false);

-- ---------------------------------------------------------------------------
-- 2. Car brands
-- ---------------------------------------------------------------------------
-- Additive: existing brands are kept even if they no longer appear in the
-- price list, per the brief.
insert into public.vehicle_makes (name) values
  ('Audi'),
  ('BMW'),
  ('BYD'),
  ('Changan'),
  ('Chery'),
  ('Daihatsu'),
  ('Haval'),
  ('Honda'),
  ('Hyundai'),
  ('Jaecoo'),
  ('KIA'),
  ('Lexus'),
  ('MG'),
  ('Mercedes-Benz'),
  ('Nissan'),
  ('Porsche'),
  ('Proton'),
  ('Range Rover'),
  ('Suzuki'),
  ('Toyota')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Re-tier any pre-existing models
-- ---------------------------------------------------------------------------
-- Models seeded before this migration still carry a legacy class, which now has
-- no price rows and would make them unquotable. Fold them into the nearest new
-- tier; the explicit list below overwrites this for anything on the price list.
update public.vehicle_models
   set vehicle_class = 'standard'
 where vehicle_class in ('sedan', 'coupe');

update public.vehicle_models
   set vehicle_class = 'large'
 where vehicle_class in ('suv', 'van', 'truck', 'luxury');

-- ---------------------------------------------------------------------------
-- 4. Models from the price list
-- ---------------------------------------------------------------------------
-- Joined on brand name so this stays re-runnable. The unique (make_id, name)
-- constraint makes the upsert idempotent and lets it correct an existing
-- model's tier.
insert into public.vehicle_models (make_id, name, vehicle_class)
select m.id, v.name, v.vehicle_class::vehicle_class
from (values
  ('Suzuki', 'Mehran', 'compact'),
  ('Suzuki', 'Alto', 'compact'),
  ('Suzuki', 'Old Cultus', 'compact'),
  ('Suzuki', 'Wagon R', 'compact'),
  ('Suzuki', 'Every', 'compact'),
  ('Suzuki', 'Bolan', 'compact'),
  ('Suzuki', 'Khyber', 'compact'),
  ('Suzuki', 'Ravi', 'compact'),
  ('Suzuki', 'Baleno', 'compact'),
  ('Suzuki', 'Liana', 'compact'),
  ('Daihatsu', 'Cuore', 'compact'),
  ('Daihatsu', 'Mira', 'compact'),
  ('Daihatsu', 'Move', 'compact'),
  ('Daihatsu', 'Mira Cocoa', 'compact'),
  ('Daihatsu', 'Tanto', 'compact'),
  ('Daihatsu', 'Naked', 'compact'),
  ('Toyota', 'Vitz', 'compact'),
  ('Toyota', 'Passo', 'compact'),
  ('Toyota', 'Aqua', 'compact'),
  ('Toyota', 'Pixis', 'compact'),
  ('Honda', 'Fit', 'compact'),
  ('Honda', 'N-WGN', 'compact'),
  ('Honda', 'N-One', 'compact'),
  ('Honda', 'N-Box', 'compact'),
  ('Nissan', 'Dayz', 'compact'),
  ('Nissan', 'Moco', 'compact'),
  ('Nissan', 'Roox', 'compact'),
  ('Nissan', 'Clipper', 'compact'),
  ('Hyundai', 'Santro', 'compact'),
  ('KIA', 'Picanto', 'compact'),
  ('Toyota', 'Corolla', 'standard'),
  ('Toyota', 'Yaris', 'standard'),
  ('Toyota', 'Prius', 'standard'),
  ('Toyota', 'Allion', 'standard'),
  ('Toyota', 'Premio', 'standard'),
  ('Toyota', 'Fielder', 'standard'),
  ('Toyota', 'Camry', 'standard'),
  ('Toyota', 'Raize', 'standard'),
  ('Toyota', 'Corolla Cross', 'standard'),
  ('Toyota', 'Sienta', 'standard'),
  ('Honda', 'City', 'standard'),
  ('Honda', 'Civic', 'standard'),
  ('Honda', 'Civic Reborn', 'standard'),
  ('Honda', 'Grace', 'standard'),
  ('Honda', 'Vezel', 'standard'),
  ('Honda', 'BR-V', 'standard'),
  ('Honda', 'Accord', 'standard'),
  ('Honda', 'HR-V', 'standard'),
  ('Suzuki', 'Swift', 'standard'),
  ('Suzuki', 'Ciaz', 'standard'),
  ('Changan', 'Alsvin', 'standard'),
  ('Changan', 'Karvaan', 'standard'),
  ('Changan', 'M9', 'standard'),
  ('Proton', 'Saga', 'standard'),
  ('Proton', 'X70', 'standard'),
  ('KIA', 'Sportage', 'large'),
  ('KIA', 'Sportage L', 'large'),
  ('KIA', 'Sorento', 'large'),
  ('KIA', 'Carnival', 'large'),
  ('KIA', 'Stonic', 'large'),
  ('KIA', 'EV9', 'large'),
  ('Hyundai', 'Tucson', 'large'),
  ('Hyundai', 'Santa Fe', 'large'),
  ('Hyundai', 'Sonata', 'large'),
  ('Hyundai', 'Elantra', 'large'),
  ('Hyundai', 'Palisade', 'large'),
  ('Hyundai', 'Grand Starex', 'large'),
  ('Toyota', 'Fortuner', 'large'),
  ('Toyota', 'Hilux', 'large'),
  ('Toyota', 'Revo', 'large'),
  ('Toyota', 'Prado', 'large'),
  ('Toyota', 'Land Cruiser', 'large'),
  ('Toyota', 'Land Cruiser 300', 'large'),
  ('Haval', 'H6', 'large'),
  ('Haval', 'H6 HEV', 'large'),
  ('Haval', 'Jolion', 'large'),
  ('MG', 'HS', 'large'),
  ('MG', 'ZS', 'large'),
  ('MG', 'MG 4', 'large'),
  ('MG', 'MG 5', 'large'),
  ('MG', 'Cyberster', 'large'),
  ('Changan', 'Oshan X7', 'large'),
  ('Chery', 'Tiggo 4 Pro', 'large'),
  ('Chery', 'Tiggo 7', 'large'),
  ('Chery', 'Tiggo 8', 'large'),
  ('BYD', 'Atto 3', 'large'),
  ('BYD', 'Seal', 'large'),
  ('BYD', 'Sealion', 'large'),
  ('Jaecoo', 'J5', 'large'),
  ('Jaecoo', 'J7', 'large'),
  ('Jaecoo', 'J8', 'large'),
  ('Audi', 'A3', 'large'),
  ('Audi', 'A4', 'large'),
  ('Audi', 'A5', 'large'),
  ('Audi', 'A6', 'large'),
  ('Audi', 'A7', 'large'),
  ('Audi', 'A8', 'large'),
  ('Audi', 'Q3', 'large'),
  ('Audi', 'Q5', 'large'),
  ('Audi', 'Q7', 'large'),
  ('Audi', 'Q8', 'large'),
  ('Audi', 'e-tron', 'large'),
  ('BMW', '3 Series', 'large'),
  ('BMW', '5 Series', 'large'),
  ('BMW', '7 Series', 'large'),
  ('BMW', 'X1', 'large'),
  ('BMW', 'X3', 'large'),
  ('BMW', 'X5', 'large'),
  ('BMW', 'X7', 'large'),
  ('Mercedes-Benz', 'C-Class', 'large'),
  ('Mercedes-Benz', 'E-Class', 'large'),
  ('Mercedes-Benz', 'S-Class', 'large'),
  ('Mercedes-Benz', 'CLA', 'large'),
  ('Mercedes-Benz', 'GLC', 'large'),
  ('Mercedes-Benz', 'GLE', 'large'),
  ('Mercedes-Benz', 'GLS', 'large'),
  ('Mercedes-Benz', 'G-Class', 'large'),
  ('Lexus', 'IS', 'large'),
  ('Lexus', 'ES', 'large'),
  ('Lexus', 'RX', 'large'),
  ('Lexus', 'LX', 'large'),
  ('Range Rover', 'Evoque', 'large'),
  ('Range Rover', 'Velar', 'large'),
  ('Range Rover', 'Sport', 'large'),
  ('Range Rover', 'Range Rover', 'large'),
  ('Porsche', 'Macan', 'large'),
  ('Porsche', 'Cayenne', 'large'),
  ('Porsche', 'Panamera', 'large')
) as v(brand_name, name, vehicle_class)
join public.vehicle_makes m on m.name = v.brand_name
on conflict (make_id, name) do update set vehicle_class = excluded.vehicle_class;

-- ---------------------------------------------------------------------------
-- 5. Pricing matrix (PKR)
-- ---------------------------------------------------------------------------
-- Windshield Restoration  compact 4,000  standard 4,500  large 5,000
-- Full Glass Polishing    compact 7,000  standard 8,000  large 9,000
-- Headlight Restoration / Car Detailing have no published prices yet, so they
-- are seeded at 0 AND left inactive -- an active service priced at 0 would be
-- offered to customers as free.
insert into public.service_prices (service_id, vehicle_class, base_price)
select s.id, p.vehicle_class::vehicle_class, p.base_price
from (values
  ('windshield-restoration', 'compact',  4000),
  ('windshield-restoration', 'standard', 4500),
  ('windshield-restoration', 'large',    5000),
  ('full-glass-polishing',   'compact',  7000),
  ('full-glass-polishing',   'standard', 8000),
  ('full-glass-polishing',   'large',    9000),
  ('headlight-restoration',  'compact',  0),
  ('headlight-restoration',  'standard', 0),
  ('headlight-restoration',  'large',    0),
  ('car-detailing',          'compact',  0),
  ('car-detailing',          'standard', 0),
  ('car-detailing',          'large',    0)
) as p(slug, vehicle_class, base_price)
join public.services s on s.slug = p.slug
on conflict (service_id, vehicle_class) do update set base_price = excluded.base_price;

-- ---------------------------------------------------------------------------
-- 6. Business details
-- ---------------------------------------------------------------------------
update public.business_settings
   set business_name = 'Car Care Daddy',
       contact_phone = '+92 328 7230630',
       service_area  = '{"type": "city", "city": "Lahore", "country": "Pakistan"}'::jsonb
 where id = true;
