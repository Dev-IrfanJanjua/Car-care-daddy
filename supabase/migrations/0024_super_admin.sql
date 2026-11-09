-- Super admin: the one thing admins cannot do is manage the team.
--
-- Everything else about the `admin` role is unchanged. A super admin is an
-- admin with an extra flag, so every existing `role = 'admin'` rule and policy
-- keeps working for both. Only these are restricted to super admins:
--   * changing anyone's `role`
--   * changing anyone's `is_super_admin`
-- The team page itself runs through the service-role key, which is exempt
-- (auth.uid() is null), exactly like the SQL editor.

alter table public.profiles
  add column if not exists is_super_admin boolean not null default false;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_super_admin
  );
$$;

create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
     and not public.is_super_admin()
     and (new.role <> old.role or new.is_super_admin <> old.is_super_admin) then
    raise exception 'only a super admin can change roles';
  end if;
  return new;
end;
$$;

-- Make yourself the first super admin (run once, in the SQL editor):
--   update public.profiles set is_super_admin = true
--   where id = (select id from auth.users where email = 'you@example.com');
