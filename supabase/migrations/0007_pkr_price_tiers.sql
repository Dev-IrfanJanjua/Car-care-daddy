-- Car Care Daddy: introduce the real price tiers.
--
-- The seeded catalog used six US-style body classes (sedan/coupe/suv/van/
-- truck/luxury). The actual price list has exactly three tiers, so add those
-- as enum values here. The six legacy values are intentionally left in the
-- type: Postgres cannot drop an enum label without recreating the type and
-- rewriting every dependent column (vehicle_models, service_prices, quotes,
-- bookings) plus the create_booking_with_services signature. They are simply
-- no longer used -- the app only ever offers the three below.
--
-- This MUST be a separate migration from 0008: Postgres forbids using a new
-- enum value in the same transaction that adds it. Run 0007, then 0008.

alter type vehicle_class add value if not exists 'compact';
alter type vehicle_class add value if not exists 'standard';
alter type vehicle_class add value if not exists 'large';
