import { createClient } from '@/lib/supabase/server'
import { GalleryManager } from '@/features/admin'

export const metadata = { title: 'Gallery' }

export default async function AdminGalleryPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('gallery_items').select('*').order('created_at', { ascending: false })

  const items = (data ?? []).map((r) => ({
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Gallery</h1>
        <p className="text-sm text-muted-foreground">Before/after pairs, photos and videos shown on the Gallery page. Featured items form the home page slider.</p>
      </div>
      <GalleryManager items={items} />
    </div>
  )
}
