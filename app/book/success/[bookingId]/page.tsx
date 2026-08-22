import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { BookingSuccessCard } from './success-card'

export default async function BookingSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookingId: string }>
  searchParams: Promise<{ t?: string }>
}) {
  const { bookingId } = await params
  const { t: accessToken } = await searchParams

  // Service-role read (guests have no session), so the booking id alone must
  // not unlock a customer's name and street address -- require the token too.
  if (!accessToken) notFound()

  const admin = createAdminClient()
  const { data: booking } = await admin
    .from('bookings')
    .select(
      'id, customer_name, vehicle_make, vehicle_model, scheduled_at, total_amount, service_address, service_city'
    )
    .eq('id', bookingId)
    .eq('access_token', accessToken)
    .single()

  if (!booking) notFound()

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12">
      <BookingSuccessCard booking={booking} />
    </main>
  )
}
