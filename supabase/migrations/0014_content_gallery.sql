-- 0014: editable home content + gallery. Safe to re-run.

alter table public.business_settings
  add column if not exists home_content jsonb;

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  service text,
  before_url text not null,
  after_url text not null,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.gallery_items enable row level security;

drop policy if exists "gallery_public_read" on public.gallery_items;
create policy "gallery_public_read" on public.gallery_items
  for select using (is_published or public.is_admin());

drop policy if exists "gallery_admin_write" on public.gallery_items;
create policy "gallery_admin_write" on public.gallery_items
  for all using (public.is_admin()) with check (public.is_admin());

create index if not exists gallery_items_created_idx on public.gallery_items (created_at desc);
