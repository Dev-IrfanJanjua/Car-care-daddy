import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { submitReview } from '@/lib/actions/reviews'

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ bookingId: string }>
}) {
  const { bookingId } = await params
  const admin = createAdminClient()

  const { data: booking } = await admin
    .from('bookings')
    .select('id, customer_name, status, vehicle_make, vehicle_model')
    .eq('id', bookingId)
    .single()

  if (!booking) notFound()

  if (booking.status !== 'completed') {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Not quite ready yet</h1>
        <p className="mt-2 text-muted-foreground">
          We can only collect a review once your appointment is complete.
        </p>
      </main>
    )
  }

  const action = submitReview.bind(null, bookingId)

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">
        How did we do, {booking.customer_name.split(' ')[0]}?
      </h1>
      <p className="mt-2 text-muted-foreground">
        {booking.vehicle_make} {booking.vehicle_model}
      </p>

      <form action={action} className="mt-8 space-y-4">
        <fieldset>
          <legend className="text-sm font-medium">Rating</legend>
          <div className="mt-2 flex gap-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="flex flex-col items-center gap-1 text-sm">
                <input type="radio" name="rating" value={n} required />
                {n}
              </label>
            ))}
          </div>
        </fieldset>

        <textarea
          name="comment"
          placeholder="Tell us about your experience (optional)"
          rows={4}
          className="w-full rounded-md border border-border bg-background px-3 py-2"
        />

        <button
          type="submit"
          className="w-full rounded-md bg-brand px-4 py-2.5 font-semibold text-brand-foreground"
        >
          Submit review
        </button>
      </form>
    </main>
  )
}
