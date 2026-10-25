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

/** The pairs shown in the home carousel: featured items first, then the newest, up to six. */
export function pickCarouselItems(items: GalleryItem[], max = 6) {
  const ordered = [...items.filter((i) => i.isFeatured), ...items.filter((i) => !i.isFeatured)]
  return ordered.slice(0, max).map((i) => ({
    id: i.id,
    title: i.title,
    category: i.service,
    before: i.beforeUrl,
    after: i.afterUrl,
  }))
}
