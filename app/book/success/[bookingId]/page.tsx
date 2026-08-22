import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CircleCheck } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/format'

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
      <Card>
        <CardContent className="flex flex-col items-center py-10 text-center">
          <CircleCheck className="size-12 text-brand" />
          <h1 className="mt-4 text-2xl font-bold">
            You&apos;re all set, {booking.customer_name.split(' ')[0]}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            We&apos;ll see you at {booking.service_address}, {booking.service_city} on{' '}
            {new Date(booking.scheduled_at).toLocaleString()}.
          </p>
          <p className="mt-4 text-lg font-semibold tabular-nums">
            Total: {formatPrice(Number(booking.total_amount))}
          </p>
          <Button variant="outline" className="mt-6" render={<Link href="/" />}>
            Back to home
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
