-- Step 1 of 2 for the four car types (Hatchback / Sedan / Crossover / SUV).
--
-- Run this on its own, then run 0019. Postgres will not let a new enum value be
-- used in the same transaction that adds it, which is why this is a separate
-- migration (same reason 0007 and 0008 were split). 'sedan' and 'suv' already
-- exist in the type from the original seed; only the two new ones are added.
-- Idempotent.

alter type vehicle_class add value if not exists 'hatchback';
alter type vehicle_class add value if not exists 'crossover';
