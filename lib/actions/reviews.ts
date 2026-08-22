'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

export async function submitReview(
  bookingId: string,
  accessToken: string,
  formData: FormData
) {
  const admin = createAdminClient()

  // The page already gates on the token, but this action is POST-able directly,
  // so it has to re-check rather than trust the bound argument alone.
  const { data: booking } = await admin
    .from('bookings')
    .select('id, status, customer_id')
    .eq('id', bookingId)
    .eq('access_token', accessToken)
    .single()

  if (!booking || booking.status !== 'completed') {
    throw new Error('This booking is not eligible for a review yet.')
  }

  const rating = Number(formData.get('rating'))
  const comment = String(formData.get('comment') || '') || null

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Invalid rating')
  }

  const { error } = await admin.from('reviews').insert({
    booking_id: bookingId,
    customer_id: booking.customer_id,
    rating,
    comment,
  })

  // reviews_one_per_booking (0005) rejects a second review for the same
  // booking; surface that as a plain message rather than a raw Postgres error.
  if (error?.code === '23505') {
    throw new Error('A review has already been submitted for this booking.')
  }
  if (error) throw error

  redirect(`/review/${bookingId}/thanks`)
}
