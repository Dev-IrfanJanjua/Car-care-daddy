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
        kind: r.kind ?? 'compare',
        beforeUrl: r.before_url,
        afterUrl: r.after_url,
        mediaUrl: r.media_url,
        posterUrl: r.poster_url,
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

/** Home slider: the featured items (up to six); if none are featured yet, the newest six. */
export function pickCarouselItems(items: GalleryItem[], max = 6) {
  const featured = items.filter((i) => i.isFeatured)
  return (featured.length ? featured : items).slice(0, max).map((i) => ({
    id: i.id,
    title: i.title,
    category: i.service,
    kind: i.kind,
    before: i.beforeUrl,
    after: i.afterUrl,
    src: i.mediaUrl,
    poster: i.posterUrl,
  }))
}
