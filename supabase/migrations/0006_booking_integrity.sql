-- Car Care: booking write integrity + reminder idempotency
-- Run after 0005_security_hardening.sql.

-- ---------------------------------------------------------------------------
-- 1. Reminder idempotency
-- ---------------------------------------------------------------------------
-- /api/cron/reminders had no send-tracking, so re-running it (a retry, a manual
-- trigger, a second deploy region) re-sent the same email. Stamped after a
-- successful send so each booking is reminded at most once.

alter table public.bookings
  add column reminder_sent_at timestamptz;

-- ---------------------------------------------------------------------------
-- 2. Atomic booking creation
-- ---------------------------------------------------------------------------
-- createBooking did three sequential writes (bookings -> booking_services ->
-- quotes.status) with no transaction. A failure between them left a booking
-- with no line items, or a quote still marked 'active' after being booked.
-- One function call = one transaction, and 2 fewer round trips on the slowest
-- path in the app.
--
-- Deliberately SECURITY INVOKER (the default): the caller's RLS still applies,
-- so this cannot become a way for an anon client to forge bookings. The
-- service-role client used by the Server Action bypasses RLS as it already did.
-- EXECUTE is also revoked from public below, belt and braces.

create function public.create_booking_with_services(
  p_quote_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_vehicle_make text,
  p_vehicle_model text,
  p_vehicle_year int,
  p_vehicle_class vehicle_class,
  p_service_address text,
  p_service_city text,
  p_service_zip text,
  p_scheduled_at timestamptz,
  p_total_amount numeric,
  p_line_items jsonb
)
returns table (new_booking_id uuid, new_access_token uuid)
language plpgsql
as $$
declare
  v_id uuid;
  v_token uuid;
begin
  -- Null-checked as well as empty-checked: jsonb_array_length(null) is null, so
  -- `= 0` would be null (falsy) and a null payload would slip through to create
  -- a booking with no line items -- exactly what this function exists to prevent.
  if p_line_items is null or jsonb_array_length(p_line_items) = 0 then
    raise exception 'a booking needs at least one service';
  end if;

  insert into public.bookings (
    quote_id, customer_name, customer_email, customer_phone,
    vehicle_make, vehicle_model, vehicle_year, vehicle_class,
    service_address, service_city, service_zip, scheduled_at, total_amount
  ) values (
    p_quote_id, p_customer_name, p_customer_email, p_customer_phone,
    p_vehicle_make, p_vehicle_model, p_vehicle_year, p_vehicle_class,
    p_service_address, p_service_city, p_service_zip, p_scheduled_at, p_total_amount
  )
  returning id, access_token into v_id, v_token;

  insert into public.booking_services (booking_id, service_id, price)
  select v_id, (item->>'service_id')::uuid, (item->>'price')::numeric
  from jsonb_array_elements(p_line_items) as item;

  if p_quote_id is not null then
    update public.quotes set status = 'booked' where id = p_quote_id;
  end if;

  return query select v_id, v_token;
end;
$$;

-- Postgres grants EXECUTE on new functions to PUBLIC by default; don't leave
-- booking creation reachable by the anon key.
revoke all on function public.create_booking_with_services(
  uuid, text, text, text, text, text, int, vehicle_class,
  text, text, text, timestamptz, numeric, jsonb
) from public;

grant execute on function public.create_booking_with_services(
  uuid, text, text, text, text, text, int, vehicle_class,
  text, text, text, timestamptz, numeric, jsonb
) to service_role;
