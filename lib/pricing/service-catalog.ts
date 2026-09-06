import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'

export const SERVICE_CATALOG_TAG = 'service-catalog'

/**
 * The whole sellable catalog: active services plus every vehicle-class price.
 *
 * Read on the homepage, both quote steps, the booking page and again when a
 * booking is created -- five round trips to a database in Tokyo for a few dozen
 * rows that change only when an admin edits them. Fetched whole rather than
 * filtered per request so that every one of those callers shares a single cache
 * entry; the filtering is trivial in memory.
 *
 * lib/actions/admin/catalog.ts revalidates this tag on every catalog write, so
 * a price change is live immediately rather than after the hour expires.
 */
export const getServiceCatalog = unstable_cache(
  async () => {
    const supabase = createPublicClient()

    const [{ data: services, error: servicesError }, { data: prices, error: pricesError }] =
      await Promise.all([
        supabase
          .from('services')
          .select('id, name, description, category, sort_order, is_active')
          .eq('is_active', true)
          .order('sort_order'),
        supabase.from('service_prices').select('service_id, vehicle_class, base_price'),
      ])

    if (servicesError) throw servicesError
    if (pricesError) throw pricesError

    return { services: services ?? [], prices: prices ?? [] }
  },
  ['service-catalog'],
  { tags: [SERVICE_CATALOG_TAG], revalidate: 3600 }
)
