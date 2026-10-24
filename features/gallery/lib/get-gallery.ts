import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import type { GalleryItem } from '../types'

export const GALLERY_TAG = 'gallery'

/** Published gallery items, newest first. Empty on any failure (e.g. migration not run). */
export const getGallery = unstable_cache(
  async (): Promise<GalleryItem[]> => {
    try {
      const { data } = await createPublicClient()
        .from('gallery_items')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      return (data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        service: r.service ?? '',
        beforeUrl: r.before_url,
        afterUrl: r.after_url,
        isPublished: r.is_published,
        isFeatured: r.is_featured,
      }))
    } catch {
      return []
    }
  },
  ['gallery'],
  { tags: [GALLERY_TAG], revalidate: 3600 }
)

/** The pair shown in the home page slider: the featured item, else the newest. */
export function pickFeatured(items: GalleryItem[]) {
  const item = items.find((i) => i.isFeatured) ?? items[0]
  return item ? { before: item.beforeUrl, after: item.afterUrl, title: item.title } : undefined
}
