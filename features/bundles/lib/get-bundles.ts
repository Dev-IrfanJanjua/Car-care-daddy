import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'

export const BUNDLES_TAG = 'bundles'

export type Bundle = {
  id: string
  slug: string
  name: string
  badge: string | null
  description: string | null
  discountPercent: number
  serviceIds: string[]
}

/** Active bundles in display order. Empty on any failure (e.g. migration not run). */
export const getBundles = unstable_cache(
  async (): Promise<Bundle[]> => {
    try {
      const { data } = await createPublicClient().from('bundles').select('*').eq('is_active', true).order('sort_order')
      return (data ?? []).map((b) => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        badge: b.badge,
        description: b.description,
        discountPercent: b.discount_percent,
        serviceIds: b.service_ids ?? [],
      }))
    } catch {
      return []
    }
  },
  ['bundles'],
  { tags: [BUNDLES_TAG], revalidate: 3600 }
)
