-- Service selection rules: a package service, a not-yet-bookable service, and
-- real prices for Headlight Restoration.
--
-- 0008 created Headlight Restoration and Car Detailing but left both inactive
-- at a price of 0, precisely so neither could be sold for nothing. This gives
-- headlights a real price and turns it on, and keeps Car Detailing visible but
-- unbookable behind a coming_soon flag.
--
-- Idempotent: re-running changes nothing.

-- ---------------------------------------------------------------------------
-- 1. Two new service flags
-- ---------------------------------------------------------------------------
-- is_package  -- selecting it clears the other selections in the picker.
-- coming_soon -- listed to advertise it, but never selectable or quotable.
--
-- coming_soon is separate from is_active on purpose: is_active means "show this
-- at all", coming_soon means "show it but do not sell it". Overloading
-- is_active=false would hide the card entirely, and every price lookup treats
-- an inactive service as a mistake rather than a teaser.
alter table public.services
  add column if not exists is_package boolean not null default false,
  add column if not exists coming_soon boolean not null default false;

-- ---------------------------------------------------------------------------
-- 2. Full Glass Polishing is the all-in package
-- ---------------------------------------------------------------------------
-- It bundles Windshield Restoration and Headlight Restoration, so the copy says
-- so outright: a customer who has just ticked one of those needs to see what
-- the package would replace before it clears their selection.
update public.services
   set is_package = true,
       description = 'Windshield and headlight restoration combined, plus machine '
                     || 'polishing across all the car''s glass to lift surface marks '
                     || 'and stains and improve overall clarity.'
 where slug = 'full-glass-polishing';

-- ---------------------------------------------------------------------------
-- 2b. Order: the two individual services, then the package that replaces them
-- ---------------------------------------------------------------------------
-- The picker groups by category and orders groups by the first service in each,
-- so sort_order alone decides where the package lands. It has to sit below its
-- two parts, or it offers to replace services the customer has not yet seen.
update public.services set sort_order = 1 where slug = 'windshield-restoration';
update public.services set sort_order = 2 where slug = 'headlight-restoration';
update public.services set sort_order = 3 where slug = 'full-glass-polishing';
update public.services set sort_order = 4 where slug = 'car-detailing';

-- ---------------------------------------------------------------------------
-- 3. Headlight Restoration: real prices, then activate
-- ---------------------------------------------------------------------------
-- compact 3,000  standard 3,500  large 4,000 -- a tier below Windshield
-- Restoration (4,000/4,500/5,000), which is the smaller job it sits beside.
update public.service_prices sp
   set base_price = v.price
  from (values
    ('compact',  3000),
    ('standard', 3500),
    ('large',    4000)
  ) as v(vehicle_class, price)
 where sp.service_id = (select id from public.services where slug = 'headlight-restoration')
   and sp.vehicle_class = v.vehicle_class::vehicle_class;

-- Only now safe to sell: the rows above are no longer 0.
update public.services
   set is_active = true
 where slug = 'headlight-restoration';

-- ---------------------------------------------------------------------------
-- 4. Car Detailing: advertised, not bookable
-- ---------------------------------------------------------------------------
-- is_active so the card renders; coming_soon so nothing will quote or sell it.
-- Its price rows stay at 0 and are never read while coming_soon is true.
update public.services
   set is_active = true,
       coming_soon = true,
       name = 'Car Detailing (Interior + Exterior)'
 where slug = 'car-detailing';
