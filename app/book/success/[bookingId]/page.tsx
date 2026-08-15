import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function BookingSuccessPage({
  params,
}: {
  params: Promise<{ bookingId: string }>
}) {
  const { bookingId } = await params

  const admin = createAdminClient()
  const { data: booking } = await admin
    .from('bookings')
    .select(
      'id, customer_name, vehicle_make, vehicle_model, scheduled_at, total_amount, service_address, service_city'
    )
    .eq('id', bookingId)
    .single()

  if (!booking) notFound()

  return (
    <main className="mx-auto max-w-xl px-4 py-12 text-center">
      <h1 className="text-2xl font-bold">
        You&apos;re all set, {booking.customer_name.split(' ')[0]}!
      </h1>
      <p className="mt-2 text-muted-foreground">
        We&apos;ll see you at {booking.service_address}, {booking.service_city} on{' '}
        {new Date(booking.scheduled_at).toLocaleString()}.
      </p>
      <p className="mt-4 text-lg font-semibold">
        Total: ${Number(booking.total_amount).toFixed(2)}
      </p>
    </main>
  )
}
