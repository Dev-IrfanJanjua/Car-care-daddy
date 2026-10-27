-- Each service can carry its own photo (uploaded in Admin -> Settings -> Services).
-- Blank means "use the default picture for the service's category".
alter table public.services add column if not exists image_url text;
