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
      'customer_email, customer_name, scheduled_at, service_address, service_city, total_amount'
    )
    .in('status', ['pending', 'confirmed'])
    .gte('scheduled_at', tomorrowStart.toISOString())
    .lte('scheduled_at', tomorrowEnd.toISOString())

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  for (const booking of bookings ?? []) {
    await sendBookingReminderEmail({
      customerEmail: booking.customer_email,
      customerName: booking.customer_name,
      scheduledAt: booking.scheduled_at,
      serviceAddress: booking.service_address,
      serviceCity: booking.service_city,
      totalAmount: Number(booking.total_amount),
    })
  }

  return NextResponse.json({ sent: bookings?.length ?? 0 })
}
