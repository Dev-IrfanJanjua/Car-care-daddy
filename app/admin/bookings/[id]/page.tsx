import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Car, MapPin, Wrench } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BookingDetailActions } from './booking-detail-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

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
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to bookings
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{booking.customer_name}</h1>
        <p className="text-sm text-muted-foreground">
          {booking.customer_email} &middot; {booking.customer_phone}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Car className="size-4 text-muted-foreground" />
            Vehicle &amp; services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {booking.vehicle_year} {booking.vehicle_make} {booking.vehicle_model} &middot;{' '}
            <span className="capitalize">{booking.vehicle_class}</span>
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {lineItems.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>{item.name}</span>
                <span className="tabular-nums">${item.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-3" />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="tabular-nums">${Number(booking.total_amount).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {photoUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wrench className="size-4 text-muted-foreground" />
              Damage photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
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
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="size-4 text-muted-foreground" />
            Location &amp; time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {booking.service_address}, {booking.service_city} {booking.service_zip}
          </p>
          <p className="text-sm text-muted-foreground">
            {new Date(booking.scheduled_at).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <BookingDetailActions
        bookingId={booking.id}
        currentStatus={booking.status}
        currentTechnicianId={booking.assigned_technician_id}
        currentNotes={booking.notes ?? ''}
        currentScheduledAt={booking.scheduled_at}
        technicians={technicians ?? []}
      />
    </div>
  )
}
