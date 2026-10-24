'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { GALLERY_TAG } from '@/features/gallery'

const BUCKET = 'site-media'

function assertOwnUrl(url: string) {
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/gallery/`
  if (!url.startsWith(base)) throw new Error('Photos must be uploaded through the form')
}

function refresh() {
  updateTag(GALLERY_TAG)
  revalidatePath('/')
  revalidatePath('/gallery')
  revalidatePath('/admin/gallery')
}

export async function addGalleryItem(input: { title: string; service: string; beforeUrl: string; afterUrl: string; isFeatured: boolean }) {
  const { supabase } = await requireAdmin()
  const title = input.title.trim().slice(0, 100)
  if (!title) throw new Error('Give the job a short title')
  assertOwnUrl(input.beforeUrl)
  assertOwnUrl(input.afterUrl)

  if (input.isFeatured) await supabase.from('gallery_items').update({ is_featured: false }).eq('is_featured', true)

  const { error } = await supabase.from('gallery_items').insert({
    title,
    service: input.service.trim().slice(0, 80) || null,
    before_url: input.beforeUrl,
    after_url: input.afterUrl,
    is_featured: input.isFeatured,
  })
  if (error) throw new Error(`${error.message} — did you run migration 0014?`)
  refresh()
}

export async function setGalleryPublished(id: string, isPublished: boolean) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('gallery_items').update({ is_published: isPublished }).eq('id', id)
  if (error) throw error
  refresh()
}

/** Only one item is "featured" (shown in the home slider) at a time. */
export async function setGalleryFeatured(id: string, isFeatured: boolean) {
  const { supabase } = await requireAdmin()
  if (isFeatured) await supabase.from('gallery_items').update({ is_featured: false }).eq('is_featured', true)
  const { error } = await supabase.from('gallery_items').update({ is_featured: isFeatured }).eq('id', id)
  if (error) throw error
  refresh()
}

export async function deleteGalleryItem(id: string) {
  const { supabase } = await requireAdmin()
  const { data: row } = await supabase.from('gallery_items').select('before_url, after_url').eq('id', id).maybeSingle()
  const { error } = await supabase.from('gallery_items').delete().eq('id', id)
  if (error) throw error

  // Best effort: free the storage too. A failure here must not undo the delete.
  if (row) {
    const marker = `/${BUCKET}/`
    const paths = [row.before_url, row.after_url]
      .map((u) => (u.includes(marker) ? u.split(marker)[1] : ''))
      .filter(Boolean)
    if (paths.length) await createAdminClient().storage.from(BUCKET).remove(paths).catch(() => null)
  }
  refresh()
}
