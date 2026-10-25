-- Catalog fixes (idempotent; safe to run more than once).

-- 1. Full Glass Polishing is a service in its own right, not a bundle. It was
--    flagged is_package, which moved it into the "Bundles" section. Exclusive
--    group 'glass-treatment' is untouched, so it still can't be booked together
--    with Windshield Restoration.
update public.services
   set is_package = false
 where slug = 'full-glass-polishing';

-- 2. Car Detailing is on hold: still listed (greyed, "Coming soon"), but it has
--    no price on the site and can't be selected for a quote or booking.
update public.services
   set coming_soon = true
 where slug = 'car-detailing';

-- 3. BUNDLES -- the section stays hidden until at least one service has
--    is_package = true. A bundle is one service row with its own price per car
--    size. The prices below are YOURS to decide, so this block is commented out:
--    fill in the numbers, remove the leading "-- " from the lines, and run it.
--
-- with b as (
--   insert into public.services (name, slug, description, category, is_package, sort_order)
--   values (
--     'Clear Vision Bundle',
--     'clear-vision-bundle',
--     'Windshield restoration plus headlight restoration in one doorstep visit.',
--     'windshield',
--     true,
--     50
--   )
--   on conflict (slug) do update set is_package = true
--   returning id
-- )
-- insert into public.service_prices (service_id, vehicle_class, base_price)
-- select b.id, v.vehicle_class, v.price
--   from b,
--        (values ('compact'::vehicle_class, 0), ('standard'::vehicle_class, 0), ('large'::vehicle_class, 0))
--        as v(vehicle_class, price)
-- on conflict (service_id, vehicle_class) do update set base_price = excluded.base_price;
