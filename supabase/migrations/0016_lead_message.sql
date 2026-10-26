-- Contact-page enquiries: the free-text message a visitor sends with the form.
alter table public.leads add column if not exists message text;
