-- Car Care: private storage bucket for customer-submitted damage photos.
-- Uploads happen server-side via the service-role client (guest flow, bypasses RLS).
-- Admins read via signed URLs, gated by this policy.

insert into storage.buckets (id, name, public)
values ('quote-photos', 'quote-photos', false)
on conflict (id) do nothing;

create policy "quote_photos_admin_read" on storage.objects
  for select using (bucket_id = 'quote-photos' and public.is_admin());
