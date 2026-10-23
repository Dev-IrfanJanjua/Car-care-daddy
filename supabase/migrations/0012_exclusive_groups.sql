-- Mutually exclusive services.
--
-- Full Glass Polishing already covers the windshield, so booking it alongside
-- Windshield Restoration pays twice for the same glass. Headlight Restoration
-- is separate work and can be added to either.
--
-- Modelled as a named group rather than a hardcoded pair: "these two are
-- alternatives" is a fact about the catalog, and an admin adding a third glass
-- treatment later should be able to slot it in without a code change. Services
-- sharing a non-null exclusive_group behave as a radio group; a null group is
-- a free-standing add-on.
--
-- is_package stays, but only as presentation now -- the badge and the
-- explanatory line. Exclusivity is entirely this column's job.
--
-- Idempotent.

alter table public.services
  add column if not exists exclusive_group text;

update public.services
   set exclusive_group = 'glass-treatment'
 where slug in ('windshield-restoration', 'full-glass-polishing');

update public.services
   set exclusive_group = null
 where slug in ('headlight-restoration', 'car-detailing');

-- The description written when the package was believed to include headlights.
-- It does not: headlights are a separate add-on, and the copy has to say what
-- the customer is actually choosing between.
update public.services
   set description = 'Machine polishing across every pane of the car''s glass, '
                     || 'windshield included, to lift surface marks and stains '
                     || 'and restore clarity.'
 where slug = 'full-glass-polishing';
