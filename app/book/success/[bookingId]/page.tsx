import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CircleCheck } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
            Total: ${Number(booking.total_amount).toFixed(2)}
          </p>
          <Button variant="outline" className="mt-6" render={<Link href="/" />}>
            Back to home
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
