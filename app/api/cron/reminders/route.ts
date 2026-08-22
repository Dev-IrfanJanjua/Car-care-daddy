import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendBookingReminderEmail } from '@/lib/email/send-booking-reminder'

// Hit once daily by an external scheduler (e.g. Vercel Cron) with
// `Authorization: Bearer <CRON_SECRET>`. Fails closed if the secret is unset.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const tomorrowStart = new Date()
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)
  tomorrowStart.setHours(0, 0, 0, 0)
  const tomorrowEnd = new Date(tomorrowStart)
  tomorrowEnd.setHours(23, 59, 59, 999)

  const { data: bookings, error } = await admin
    .from('bookings')
    .select(
      'id, access_token, customer_email, customer_name, scheduled_at, service_address, service_city, total_amount'
    )
    .in('status', ['pending', 'confirmed'])
    // Idempotency: skip anything already reminded, so a retry or a second
    // invocation doesn't email the same customer twice.
    .is('reminder_sent_at', null)
    .gte('scheduled_at', tomorrowStart.toISOString())
    .lte('scheduled_at', tomorrowEnd.toISOString())

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let sent = 0
  for (const booking of bookings ?? []) {
    await sendBookingReminderEmail({
      bookingId: booking.id,
      accessToken: booking.access_token,
      customerEmail: booking.customer_email,
      customerName: booking.customer_name,
      scheduledAt: booking.scheduled_at,
      serviceAddress: booking.service_address,
      serviceCity: booking.service_city,
      totalAmount: Number(booking.total_amount),
    })

    // Stamped per booking rather than in one bulk update, so a mid-loop crash
    // doesn't re-send the ones that already went out.
    const { error: stampError } = await admin
      .from('bookings')
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq('id', booking.id)
    if (!stampError) sent += 1
  }

  // quote_status 'expired' was previously unreachable -- expires_at defaulted to
  // +7 days but nothing ever transitioned the row. Piggy-backs on this job.
  const { count: expired } = await admin
    .from('quotes')
    .update({ status: 'expired' }, { count: 'exact' })
    .eq('status', 'active')
    .lt('expires_at', new Date().toISOString())

  return NextResponse.json({
    matched: bookings?.length ?? 0,
    sent,
    quotesExpired: expired ?? 0,
  })
}
