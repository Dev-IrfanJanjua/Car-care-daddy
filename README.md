# Car Aurum

Instant transparent pricing for mobile auto-glass repair: windshield chip repair, polishing,
headlight restoration, and more. Next.js (App Router) + Supabase.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is fine).
2. **Run the migrations** against it, in order, via the SQL editor in the Supabase dashboard
   (or the Supabase CLI if you have it linked):
   - `supabase/migrations/0001_init_schema.sql`
   - `supabase/migrations/0002_rls_policies.sql`
   - `supabase/migrations/0003_seed.sql`
   - `supabase/migrations/0004_storage.sql` (damage-photo upload bucket)
   - `supabase/migrations/0005_security_hardening.sql` (role-escalation guard,
     per-booking access tokens, one-review-per-booking)
   - `supabase/migrations/0006_booking_integrity.sql` (atomic booking creation,
     reminder idempotency)
3. **Copy env vars**: `cp .env.local.example .env.local`, then fill in the values from
   your Supabase project's Settings → API page (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
4. **Create your first admin user**: add the user through Supabase Auth (dashboard →
   Authentication → Add user), then promote it from the dashboard SQL editor:
   ```sql
   update public.profiles set role = 'admin' where id = '<the user's uuid>';
   ```
   The `profiles_guard_role` trigger from `0005` blocks a signed-in user from
   changing their own role, but deliberately allows it from the SQL editor and
   the service-role client (no `auth.uid()`), so this step still works.
5. **Turn off public signups** (dashboard → Authentication → Providers → Email).
   There is no customer-facing sign-up flow — `/login` is staff-only — so leaving
   signups open is unnecessary attack surface.
6. Install dependencies and run the dev server:
   ```bash
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `app/quote/*` — customer quote wizard: vehicle picker → service selection → computed quote
- `app/book/*` — booking flow: scheduling, guest checkout, confirmation
- `app/admin/*` — staff back-office (bookings, technicians, leads, partners, reports, settings)
- `lib/supabase/` — Supabase client helpers (`client.ts` browser, `server.ts` SSR, `admin.ts`
  service-role, server-only)
- `lib/pricing/calculate-quote.ts` — server-side pricing engine, the single source of truth for
  every quote/booking total
- `lib/actions/` — Server Actions (guest quote/lead/booking writes go through the service-role
  client here, never through client-side RLS)
- `supabase/migrations/` — schema, RLS policies, seed data

Note: `proxy.ts` (not `middleware.ts` — renamed in Next.js 16) does an optimistic session check
for `/admin/*`; the authoritative role check lives in `app/admin/layout.tsx`, and every
admin-only Server Action re-verifies via `lib/auth/require-admin.ts`.

## Optional: shop alerts & daily jobs

The only email this app sends is a new-booking alert to the shop, via
[Brevo](https://brevo.com); a WhatsApp alert goes out through CallMeBot. Both are best-effort and
silently no-op until their variables in `.env.local.example` are set (`BREVO_*`, `ADMIN_EMAIL`,
`CALLMEBOT_*`). Customers are never emailed — they confirm over WhatsApp.

Daily job (`/api/cron/reminders`): expires stale quotes and, if enabled under
**Admin → Appearance → Booking automation**, advances booking statuses (confirmed → in progress at
start time → completed 4 hours later). Set `CRON_SECRET` locally and in your host; on Vercel,
`vercel.json` schedules it and Vercel sends the bearer header automatically. The admin dashboard and
bookings list also run the status update when opened, so the board is current without a faster cron.

## Appearance & hero media

**Admin → Appearance** picks the colour scheme, accent, default theme and hero photo/video with a
live preview; nothing goes live until you press Save. It needs migration
`supabase/migrations/0013_brand_settings.sql` (adds the settings columns and the public `site-media`
storage bucket). Set `NEXT_PUBLIC_SITE_URL` in production so `sitemap.xml`, `robots.txt` and the
structured data use the right domain.
