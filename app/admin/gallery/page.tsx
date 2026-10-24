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
    beforeUrl: r.before_url,
    afterUrl: r.after_url,
    isPublished: r.is_published,
    isFeatured: r.is_featured,
  }))

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Gallery</h1>
        <p className="text-sm text-muted-foreground">Before-and-after photos shown on the Gallery page and the home slider.</p>
      </div>
      <GalleryManager items={items} />
    </div>
  )
}
