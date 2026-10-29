-- 0023: OG (Open Graph) image for social sharing.
-- Run in the Supabase SQL editor. Safe to re-run.

alter table public.business_settings
  add column if not exists og_image_url text;
