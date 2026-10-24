'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { CONTENT_TAG, sanitizeContent, type HomeContent } from '@/features/content'

/** Saves the whole home-content draft in one write (called from the editor's Save button). */
export async function saveHomeContent(input: HomeContent) {
  const { supabase } = await requireAdmin()
  const clean = sanitizeContent(input)

  const { data, error } = await supabase
    .from('business_settings')
    .update({ home_content: clean })
    .eq('id', true)
    .select('id')

  if (error) throw error
  if (!data?.length) throw new Error('Nothing was saved. Run migration 0014 in Supabase first.')

  updateTag(CONTENT_TAG)
  revalidatePath('/')
  return clean
}

/** Back to the built-in copy. */
export async function resetHomeContent() {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('business_settings').update({ home_content: null }).eq('id', true)
  if (error) throw error
  updateTag(CONTENT_TAG)
  revalidatePath('/')
}
