-- 0013: appearance + hero media + automatic booking status.
-- Run in the Supabase SQL editor. Safe to re-run.

alter table public.business_settings
  add column if not exists color_scheme text not null default 'midnight-pearl',
  add column if not exists accent_color text,
  add column if not exists default_theme text not null default 'light',
  add column if not exists hero_media_type text not null default 'video',
  add column if not exists hero_video_url text,
  add column if not exists hero_image_url text,
  add column if not exists hero_poster_url text,
  add column if not exists auto_status boolean not null default true;

alter table public.business_settings drop constraint if exists business_settings_default_theme_check;
alter table public.business_settings add constraint business_settings_default_theme_check
  check (default_theme in ('light', 'dark', 'system'));

alter table public.business_settings drop constraint if exists business_settings_hero_media_type_check;
alter table public.business_settings add constraint business_settings_hero_media_type_check
  check (hero_media_type in ('video', 'image'));

alter table public.business_settings drop constraint if exists business_settings_accent_color_check;
alter table public.business_settings add constraint business_settings_accent_color_check
  check (accent_color is null or accent_color ~ '^#[0-9a-fA-F]{6}$');

-- Public bucket for site media (hero video / image). Reads are public; writes
-- happen through signed upload URLs minted by an admin-only server action, but
-- the policies below also keep direct writes admin-only.
insert into storage.buckets (id, name, public, file_size_limit)
values ('site-media', 'site-media', true, 52428800)
on conflict (id) do update set public = true, file_size_limit = 52428800;

drop policy if exists "site_media_public_read" on storage.objects;
create policy "site_media_public_read" on storage.objects
  for select using (bucket_id = 'site-media');

drop policy if exists "site_media_admin_write" on storage.objects;
create policy "site_media_admin_write" on storage.objects
  for all using (bucket_id = 'site-media' and public.is_admin())
  with check (bucket_id = 'site-media' and public.is_admin());
