import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { syncBookingStatuses } from '@/features/admin'

// Hit once daily by an external scheduler (e.g. Vercel Cron) with
// `Authorization: Bearer <CRON_SECRET>`. Fails closed if the secret is unset.
//
// The day-before reminder email this route was named for is gone -- customers
// are contacted over WhatsApp now, not email. Expiring stale quotes is the
// remaining job. The path is kept as-is because vercel.json registers this
// exact URL as the cron target; renaming it buys nothing and risks a silently
// unscheduled job.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const given = Buffer.from(request.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${secret}`)
  // Constant-time comparison so the secret can't be guessed from response timing.
  if (!secret || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  // quote_status 'expired' was previously unreachable -- expires_at defaulted to
  // +7 days but nothing ever transitioned the row.
  const { count: expired, error } = await admin
    .from('quotes')
    .update({ status: 'expired' }, { count: 'exact' })
    .eq('status', 'active')
    .lt('expires_at', new Date().toISOString())

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Drop expired rate-limit counters (no-op if migration 0015 is not applied).
  await admin.rpc('purge_rate_limits')

  // Also advances booking statuses (confirmed -> in progress -> completed).
  const statuses = await syncBookingStatuses({ force: true })

  return NextResponse.json({ quotesExpired: expired ?? 0, bookingStatuses: statuses })
}
