'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'site-media'

// Customer reviews are created held (is_public defaults to false as of 0005), so
// nothing reaches the public homepage without passing through here.
export async function setReviewPublic(reviewId: string, isPublic: boolean) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('reviews')
    .update({ is_public: isPublic })
    .eq('id', reviewId)
  if (error) throw error

  revalidatePath('/admin/reviews')
  revalidatePath('/')
}

export type NewReview = {
  name: string
  city: string
  rating: number
  comment: string
  imageUrls: string[]
  publish: boolean
}

/** A review the shop adds itself (phone / WhatsApp customers, screenshots of kind messages). */
export async function addReview(input: NewReview) {
  const { supabase } = await requireAdmin()

  const name = input.name.trim().slice(0, 60)
  const comment = input.comment.trim().slice(0, 1000)
  if (!name) throw new Error('Add the customer name')
  if (!comment) throw new Error('Add what the customer said')
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) throw new Error('Choose a rating from 1 to 5')

  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/reviews/`
  const imageUrls = input.imageUrls.filter((u) => u.startsWith(base)).slice(0, 3)

  const { error } = await supabase.from('reviews').insert({
    rating: input.rating,
    comment,
    reviewer_name: name,
    reviewer_city: input.city.trim().slice(0, 40) || 'Lahore',
    image_urls: imageUrls,
    is_public: input.publish,
    source: 'admin',
  })
  if (error) throw new Error(`${error.message} — did you run migration 0021?`)

  revalidatePath('/admin/reviews')
  revalidatePath('/')
}

export async function deleteReview(reviewId: string) {
  const { supabase } = await requireAdmin()
  const { data: row } = await supabase.from('reviews').select('image_urls').eq('id', reviewId).maybeSingle()
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId)
  if (error) throw error

  // Best effort: free the photos too; a failure must not undo the delete.
  const marker = `/${BUCKET}/`
  const paths = (row?.image_urls ?? []).map((u) => (u.includes(marker) ? u.split(marker)[1] : '')).filter(Boolean)
  if (paths.length) await createAdminClient().storage.from(BUCKET).remove(paths).catch(() => null)

  revalidatePath('/admin/reviews')
  revalidatePath('/')
}
