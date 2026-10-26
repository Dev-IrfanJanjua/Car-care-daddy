-- Three more glass polishing options between Windshield Restoration (front
-- only) and Full Glass Polishing (every pane). All five share the
-- 'glass-treatment' exclusive group, so a customer can pick only one of them
-- per booking; Headlight Restoration stays outside the group and can be added
-- to any of them. Idempotent.
--
-- The prices below are STARTING VALUES -- change them any time under
-- Admin -> Services & pricing. Existing prices are never overwritten.

insert into public.services (name, slug, description, category, is_package, exclusive_group, sort_order)
values
  ('Front & Back Screen Polishing', 'front-back-screen-polishing',
   'Machine polishing of the windshield and the rear screen to remove water spots, wiper marks and haze.',
   'glass', false, 'glass-treatment', 2),
  ('Front & 2 Doors Polishing', 'front-2-doors-polishing',
   'Windshield plus the two front door glasses polished clear — the panes you look through most.',
   'glass', false, 'glass-treatment', 3),
  ('Front & All Doors Polishing', 'front-all-doors-polishing',
   'Windshield plus every door glass polished, for a clear view all around.',
   'glass', false, 'glass-treatment', 4)
on conflict (slug) do update
  set exclusive_group = 'glass-treatment',
      category = 'glass';

-- Keep the order Windshield -> Front & Back -> Front & 2 Doors -> Front & All
-- Doors -> Full Glass -> Headlights -> Detailing.
update public.services set sort_order = 1 where slug = 'windshield-restoration';
update public.services set sort_order = 5 where slug = 'full-glass-polishing';
update public.services set sort_order = 6 where slug = 'headlight-restoration';
update public.services set sort_order = 7 where slug = 'car-detailing';

insert into public.service_prices (service_id, vehicle_class, base_price)
select s.id, p.vehicle_class::vehicle_class, p.price
  from public.services s
  join (values
    ('front-back-screen-polishing', 'hatchback', 5500),
    ('front-back-screen-polishing', 'sedan',     6000),
    ('front-back-screen-polishing', 'crossover', 6800),
    ('front-back-screen-polishing', 'suv',       6800),
    ('front-2-doors-polishing',     'hatchback', 6000),
    ('front-2-doors-polishing',     'sedan',     6500),
    ('front-2-doors-polishing',     'crossover', 7300),
    ('front-2-doors-polishing',     'suv',       7300),
    ('front-all-doors-polishing',   'hatchback', 6500),
    ('front-all-doors-polishing',   'sedan',     7200),
    ('front-all-doors-polishing',   'crossover', 8000),
    ('front-all-doors-polishing',   'suv',       8000)
  ) as p(slug, vehicle_class, price) on p.slug = s.slug
on conflict (service_id, vehicle_class) do nothing;
