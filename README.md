# Car Care

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
3. **Copy env vars**: `cp .env.local.example .env.local`, then fill in the values from
   your Supabase project's Settings → API page (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
4. **Create your first admin user**: sign up once through Supabase Auth (dashboard →
   Authentication → Add user, or build/use the app's own sign-up flow), then promote it:
   ```sql
   update public.profiles set role = 'admin' where id = '<the user's uuid>';
   ```
5. Install dependencies and run the dev server:
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

## Optional: email confirmations & reminders

Booking confirmation emails and day-before reminders go through
[Resend](https://resend.com) and are best-effort — everything works without them, they just
silently no-op until `RESEND_API_KEY` is set. To enable:

1. Create a free Resend account and API key, add it as `RESEND_API_KEY`.
2. Set a `CRON_SECRET` value (any random string) as an env var, both locally and in your
   deployment platform.
3. On Vercel, `vercel.json` already schedules a daily hit to `/api/cron/reminders` — Vercel
   automatically sends `Authorization: Bearer $CRON_SECRET` for cron invocations once
   `CRON_SECRET` is set in the project's env vars. On another host, trigger that same route
   once a day with that header yourself.
4. Emails send from Resend's shared sandbox address (`onboarding@resend.dev`), which works
   with just an API key. Verify your own domain in Resend before going to production.
