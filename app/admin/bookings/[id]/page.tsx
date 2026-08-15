import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BookingDetailActions } from './booking-detail-actions'

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: booking }, { data: bookingServices }, { data: technicians }] = await Promise.all([
    supabase.from('bookings').select('*').eq('id', id).single(),
    supabase.from('booking_services').select('id, service_id, price').eq('booking_id', id),
    supabase.from('technicians').select('id, full_name').eq('status', 'active').order('full_name'),
  ])

  if (!booking) notFound()

  const serviceIds = (bookingServices ?? []).map((bs) => bs.service_id)
  const { data: services } =
    serviceIds.length > 0
      ? await supabase.from('services').select('id, name').in('id', serviceIds)
      : { data: [] }
  const serviceNameById = new Map((services ?? []).map((s) => [s.id, s.name]))

  const lineItems = (bookingServices ?? []).map((bs) => ({
    id: bs.id,
    name: serviceNameById.get(bs.service_id) ?? 'Unknown service',
    price: Number(bs.price),
  }))

  const { data: photos } = booking.quote_id
    ? await supabase.from('photos').select('id, storage_path').eq('quote_id', booking.quote_id)
    : { data: [] }

  const photoUrls = await Promise.all(
    (photos ?? []).map(async (p) => {
      const { data } = await supabase.storage
        .from('quote-photos')
        .createSignedUrl(p.storage_path, 60 * 60)
      return { id: p.id, url: data?.signedUrl ?? null }
    })
  )

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">{booking.customer_name}</h1>
      <p className="text-muted-foreground">
        {booking.customer_email} &middot; {booking.customer_phone}
      </p>

      <div className="mt-6 rounded-lg border border-border p-4">
        <h2 className="font-semibold">Vehicle &amp; services</h2>
        <p className="mt-1 text-sm">
          {booking.vehicle_year} {booking.vehicle_make} {booking.vehicle_model} (
          {booking.vehicle_class})
        </p>
        <ul className="mt-3 space-y-1 text-sm">
          {lineItems.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>{item.name}</span>
              <span>${item.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-border pt-3 font-semibold">
          <span>Total</span>
          <span>${Number(booking.total_amount).toFixed(2)}</span>
        </div>
      </div>

      {photoUrls.length > 0 && (
        <div className="mt-6 rounded-lg border border-border p-4">
          <h2 className="font-semibold">Damage photos</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {photoUrls.map(
              (p) =>
                p.url && (
                  // eslint-disable-next-line @next/next/no-img-element -- signed URL, not worth remotePatterns config
                  <img
                    key={p.id}
                    src={p.url}
                    alt="Damage photo submitted with quote"
                    className="aspect-square rounded-md border border-border object-cover"
                  />
                )
            )}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-lg border border-border p-4">
        <h2 className="font-semibold">Location &amp; time</h2>
        <p className="mt-1 text-sm">
          {booking.service_address}, {booking.service_city} {booking.service_zip}
        </p>
        <p className="text-sm text-muted-foreground">
          {new Date(booking.scheduled_at).toLocaleString()}
        </p>
      </div>

      <BookingDetailActions
        bookingId={booking.id}
        currentStatus={booking.status}
        currentTechnicianId={booking.assigned_technician_id}
        currentNotes={booking.notes ?? ''}
        technicians={technicians ?? []}
      />
    </div>
  )
}
