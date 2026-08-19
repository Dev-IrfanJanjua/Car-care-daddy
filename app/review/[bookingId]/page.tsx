import { notFound } from 'next/navigation'
import { Star } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { submitReview } from '@/lib/actions/reviews'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

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

  const action = submitReview.bind(null, bookingId)

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
          <form action={action} className="space-y-4">
            <fieldset>
              <Label>Rating</Label>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Label key={n} className="cursor-pointer">
                    <input type="radio" name="rating" value={n} required className="peer sr-only" />
                    <Star className="size-8 text-muted-foreground transition-colors peer-checked:fill-brand peer-checked:text-brand" />
                  </Label>
                ))}
              </div>
            </fieldset>

            <Textarea name="comment" placeholder="Tell us about your experience (optional)" rows={4} />

            <Button type="submit" className="w-full">
              Submit review
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
