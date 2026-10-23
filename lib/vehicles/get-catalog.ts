import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'

export const VEHICLE_CATALOG_TAG = 'vehicle-catalog'

/**
 * Every make and every model, for the vehicle picker at /quote.
 *
 * Cached because it is the largest read in the app -- well over a hundred model
 * rows -- and it was hitting the database on every visit to the first step of
 * the quote flow, from a function region on the far side of the world from it.
 * The catalog only changes when an admin edits it, and
 * lib/actions/admin/catalog.ts revalidates this tag when they do, so the hour
 * is a backstop rather than the mechanism.
 */
export const getVehicleCatalog = unstable_cache(
  async () => {
    const supabase = createPublicClient()

    const [{ data: makes, error: makesError }, { data: models, error: modelsError }] =
      await Promise.all([
        supabase.from('vehicle_makes').select('id, name').order('name'),
        supabase.from('vehicle_models').select('id, make_id, name, vehicle_class').order('name'),
      ])

    if (makesError) throw makesError
    if (modelsError) throw modelsError

    return { makes: makes ?? [], models: models ?? [] }
  },
  ['vehicle-catalog'],
  { tags: [VEHICLE_CATALOG_TAG], revalidate: 3600 }
)
