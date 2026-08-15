'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

export async function submitReview(bookingId: string, formData: FormData) {
  const admin = createAdminClient()

  const { data: booking } = await admin
    .from('bookings')
    .select('id, status, customer_id')
    .eq('id', bookingId)
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
  if (error) throw error

  redirect(`/review/${bookingId}/thanks`)
}
