-- Editable social profiles.
--
-- Facebook and Instagram were compiled into lib/contact.ts, so changing either
-- meant a deploy. They join contact_email and contact_phone as settings the
-- shop owns.
--
-- Stored as free text rather than a strict URL: an admin will paste
-- "https://facebook.com/carcaredaddy", "facebook.com/carcaredaddy",
-- "/carcaredaddy" or "@carcaredaddy" depending on where they copied from, and
-- lib/business-contact.ts resolves all of those to a working link. A column
-- constraint would reject three of the four and teach the shop that the field
-- is broken.
--
-- Idempotent.

alter table public.business_settings
  add column if not exists facebook_url text,
  add column if not exists instagram_url text;

-- Seed from the printed business card so the fields are not blank on first
-- open. Only fills them when unset, so a later edit is never clobbered by
-- re-running this.
update public.business_settings
   set facebook_url = coalesce(facebook_url, 'carcaredaddy'),
       instagram_url = coalesce(instagram_url, 'carcaredaddy')
 where id = true;
