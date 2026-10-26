'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { GALLERY_TAG } from '@/features/gallery'
import type { Database } from '@/lib/types/database.types'

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

export type NewGalleryItem =
  | { kind: 'compare'; title: string; service: string; beforeUrl: string; afterUrl: string; isFeatured: boolean }
  | { kind: 'image'; title: string; service: string; mediaUrl: string; isFeatured: boolean }
  | { kind: 'video'; title: string; service: string; mediaUrl: string; posterUrl: string; isFeatured: boolean }

export async function addGalleryItem(input: NewGalleryItem) {
  const { supabase } = await requireAdmin()
  const title = input.title.trim().slice(0, 100)
  if (!title) throw new Error('Give it a short title')

  const base = {
    title,
    service: input.service.trim().slice(0, 80) || null,
    is_featured: input.isFeatured,
    kind: input.kind,
  }
  let row: Database['public']['Tables']['gallery_items']['Insert']
  if (input.kind === 'compare') {
    assertOwnUrl(input.beforeUrl)
    assertOwnUrl(input.afterUrl)
    row = { ...base, before_url: input.beforeUrl, after_url: input.afterUrl }
  } else if (input.kind === 'image') {
    assertOwnUrl(input.mediaUrl)
    row = { ...base, media_url: input.mediaUrl }
  } else if (input.kind === 'video') {
    assertOwnUrl(input.mediaUrl)
    assertOwnUrl(input.posterUrl)
    row = { ...base, media_url: input.mediaUrl, poster_url: input.posterUrl }
  } else {
    throw new Error('Unknown type')
  }

  const { error } = await supabase.from('gallery_items').insert(row)
  if (error) throw new Error(`${error.message} — did you run migration 0019?`)
  refresh()
}

export async function setGalleryPublished(id: string, isPublished: boolean) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('gallery_items').update({ is_published: isPublished }).eq('id', id)
  if (error) throw error
  refresh()
}

/** Featured items make up the home slider (up to six are shown). */
export async function setGalleryFeatured(id: string, isFeatured: boolean) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('gallery_items').update({ is_featured: isFeatured }).eq('id', id)
  if (error) throw error
  refresh()
}

export async function deleteGalleryItem(id: string) {
  const { supabase } = await requireAdmin()
  const { data: row } = await supabase.from('gallery_items').select('before_url, after_url, media_url, poster_url').eq('id', id).maybeSingle()
  const { error } = await supabase.from('gallery_items').delete().eq('id', id)
  if (error) throw error

  // Best effort: free the storage too. A failure here must not undo the delete.
  if (row) {
    const marker = `/${BUCKET}/`
    const paths = [row.before_url, row.after_url, row.media_url, row.poster_url]
      .map((u) => (u && u.includes(marker) ? u.split(marker)[1] : ''))
      .filter(Boolean)
    if (paths.length) await createAdminClient().storage.from(BUCKET).remove(paths).catch(() => null)
  }
  refresh()
}
