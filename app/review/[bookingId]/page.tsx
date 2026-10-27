import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { submitReview } from '@/lib/actions/reviews'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReviewForm } from './review-form'

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookingId: string }>
  searchParams: Promise<{ t?: string }>
}) {
  const { bookingId } = await params
  const { t: accessToken } = await searchParams
  const admin = createAdminClient()

  // This page reads with the service-role key (a guest has no session), so the
  // booking id alone must not be enough -- the per-booking token gates it.
  if (!accessToken) notFound()

  const { data: booking } = await admin
    .from('bookings')
    .select('id, customer_name, status, vehicle_make, vehicle_model')
    .eq('id', bookingId)
    .eq('access_token', accessToken)
    .single()

  if (!booking) notFound()

  if (booking.status !== 'completed') {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-16">
        <Card>
          <CardContent className="py-10 text-center">
            <h1 className="text-2xl font-bold">Not quite ready yet</h1>
            <p className="mt-2 text-muted-foreground">
              We can only collect a review once your appointment is complete.
            </p>
          </CardContent>
        </Card>
      </main>
    )
  }

  const action = submitReview.bind(null, bookingId, accessToken)

  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            How did we do, {booking.customer_name.split(' ')[0]}?
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {booking.vehicle_make} {booking.vehicle_model}
          </p>
        </CardHeader>
        <CardContent>
          <ReviewForm action={action} bookingId={bookingId} accessToken={accessToken} defaultName={booking.customer_name.split(' ')[0]} />
        </CardContent>
      </Card>
    </main>
  )
}
