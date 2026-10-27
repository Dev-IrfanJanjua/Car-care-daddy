'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/security/rate-limit'
import { text, isUuid } from '@/lib/security/validate'

const BUCKET = 'site-media'
const MAX_PHOTOS = 3
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const PHOTO_MAX_BYTES = 5 * 1024 * 1024
const TOKEN_RE = /^[0-9a-zA-Z-]{8,80}$/

/** The booking must exist, match its private token and be completed. */
async function eligibleBooking(bookingId: string, accessToken: string) {
  if (!isUuid(bookingId) || !TOKEN_RE.test(accessToken)) throw new Error('Invalid review link.')
  const admin = createAdminClient()
  const { data: booking } = await admin
    .from('bookings')
    .select('id, status, customer_id, customer_name')
    .eq('id', bookingId)
    .eq('access_token', accessToken)
    .single()
  if (!booking || booking.status !== 'completed') {
    throw new Error('This booking is not eligible for a review yet.')
  }
  return { admin, booking }
}

/**
 * Step 1 of attaching a photo: a one-shot signed upload URL so the browser can
 * send the image straight to storage (a Server Action body is capped well below
 * a phone photo). Gated by the booking's private token, so only a real,
 * completed booking can upload, and rate-limited.
 */
export async function createReviewPhotoUploadUrl(bookingId: string, accessToken: string, fileName: string, contentType: string, size: number) {
  await rateLimit('review-photo', { max: 20, windowSeconds: 3600 })
  const { admin } = await eligibleBooking(bookingId, accessToken)

  if (!PHOTO_TYPES.includes(contentType)) throw new Error('Use a JPG, PNG or WebP photo.')
  if (size > PHOTO_MAX_BYTES) throw new Error('That photo is too large (max 5 MB).')

  const ext = (fileName.split('.').pop() ?? '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'jpg'
  const path = `reviews/${bookingId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path)
  if (error || !data) throw new Error('Could not start the upload. Please try again.')
  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path)
  return { path, token: data.token, publicUrl: pub.publicUrl }
}

export async function submitReview(bookingId: string, accessToken: string, formData: FormData) {
  await rateLimit('review', { max: 10, windowSeconds: 3600 })

  // The page already gates on the token, but this action is POST-able directly,
  // so it has to re-check rather than trust the bound argument alone.
  const { admin, booking } = await eligibleBooking(bookingId, accessToken)

  const rating = Number(formData.get('rating'))
  const comment = text(formData, 'comment', { label: 'Comment', max: 1000 }) || null
  const reviewerName = text(formData, 'reviewerName', { label: 'Name', max: 60 }) || booking.customer_name.split(' ')[0]

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Invalid rating')
  }

  // Photos arrive as URLs of files the browser already uploaded. Only accept
  // ones under this booking's own prefix, so a review can't point at arbitrary
  // images elsewhere.
  const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/reviews/${bookingId}-`
  let imageUrls: string[] = []
  try {
    const parsed = JSON.parse(String(formData.get('images') || '[]'))
    if (Array.isArray(parsed)) imageUrls = parsed.filter((u): u is string => typeof u === 'string' && u.startsWith(prefix)).slice(0, MAX_PHOTOS)
  } catch {
    imageUrls = []
  }

  const { error } = await admin.from('reviews').insert({
    booking_id: bookingId,
    customer_id: booking.customer_id,
    rating,
    comment,
    reviewer_name: reviewerName,
    image_urls: imageUrls,
    source: 'customer',
  })

  // reviews_one_per_booking (0005) rejects a second review for the same
  // booking; surface that as a plain message rather than a raw Postgres error.
  if (error?.code === '23505') {
    throw new Error('A review has already been submitted for this booking.')
  }
  if (error) throw error

  redirect(`/review/${bookingId}/thanks`)
}
