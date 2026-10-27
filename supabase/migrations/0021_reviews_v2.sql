-- Reviews v2: photos on reviews, and reviews the shop adds itself.
--
--  * booking_id becomes optional, so the admin can add a review for a customer
--    who booked by phone or WhatsApp (the one-review-per-booking unique
--    constraint still applies; Postgres allows many NULLs).
--  * reviewer_name / reviewer_city are what the website shows on the card.
--  * image_urls holds up to 3 photos (public URLs in the site-media bucket).
--  * source says who wrote it: 'customer' (via the review link) or 'admin'.

alter table public.reviews alter column booking_id drop not null;

alter table public.reviews add column if not exists reviewer_name text;
alter table public.reviews add column if not exists reviewer_city text not null default 'Lahore';
alter table public.reviews add column if not exists image_urls text[] not null default '{}';
alter table public.reviews add column if not exists source text not null default 'customer';

alter table public.reviews drop constraint if exists reviews_source_check;
alter table public.reviews add constraint reviews_source_check check (source in ('customer', 'admin'));

alter table public.reviews drop constraint if exists reviews_image_urls_max;
alter table public.reviews add constraint reviews_image_urls_max check (coalesce(array_length(image_urls, 1), 0) <= 3);

-- Admins could already update reviews; they now also insert and delete them
-- (customer reviews still go in through a Server Action with the service role).
drop policy if exists "reviews_admin_insert" on public.reviews;
create policy "reviews_admin_insert" on public.reviews
  for insert with check (public.is_admin());

drop policy if exists "reviews_admin_delete" on public.reviews;
create policy "reviews_admin_delete" on public.reviews
  for delete using (public.is_admin());
