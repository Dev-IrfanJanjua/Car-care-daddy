'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'

// Reviews are created held (is_public defaults to false as of 0005), so
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
