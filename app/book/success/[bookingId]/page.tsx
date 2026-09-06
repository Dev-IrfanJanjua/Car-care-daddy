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
      'id, customer_name, vehicle_make, vehicle_model, vehicle_year, scheduled_at, total_amount, service_address, service_city'
    )
    .eq('id', bookingId)
    .eq('access_token', accessToken)
    .single()

  if (!booking) notFound()

  // Line items feed the WhatsApp handoff message, which itemises the order.
  // Two queries joined in JS rather than a nested select: database.types.ts
  // declares `Relationships: []`, so an embedded resource does not type-check.
  const { data: bookingServices } = await admin
    .from('booking_services')
    .select('service_id, price')
    .eq('booking_id', booking.id)

  const serviceIds = (bookingServices ?? []).map((row) => row.service_id)
  const { data: services } = serviceIds.length
    ? await admin.from('services').select('id, name').in('id', serviceIds)
    : { data: [] }

  const nameById = new Map((services ?? []).map((s) => [s.id, s.name]))
  const lineItems = (bookingServices ?? []).map((row) => ({
    name: nameById.get(row.service_id) ?? 'Service',
    price: Number(row.price),
  }))

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12">
      <BookingSuccessCard booking={booking} lineItems={lineItems} />
    </main>
  )
}
