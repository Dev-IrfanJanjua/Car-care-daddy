import { getVehicleCatalog } from '@/lib/vehicles/get-catalog'
import { getServiceCatalog } from '@/lib/pricing/service-catalog'
import type { PriceFinderData } from '../types'

// Shown as one-tap chips under the car field; any name not in the catalog is
// simply skipped, so this list can be generous.
const QUICK_PICKS = ['Alto', 'Cultus', 'City', 'Corolla', 'Civic', 'Yaris', 'Sportage', 'Tucson', 'Fortuner', 'Elantra']

/**
 * Everything the price bar needs, shaped for the client. Both catalogs are
 * already cached (see lib/vehicles/get-catalog.ts and lib/pricing/service-catalog.ts),
 * so this adds no database round trips. Prices still come only from the catalog
 * tables -- the bar displays them, the server pricing engine remains the source
 * of truth for what a booking actually costs.
 */
export async function getPriceFinderData(): Promise<PriceFinderData> {
  const [{ makes, models }, { services, prices }] = await Promise.all([
    getVehicleCatalog(),
    getServiceCatalog(),
  ])

  const makeName = new Map(makes.map((m) => [m.id, m.name]))

  const vehicles = models.flatMap((m) => {
    const make = makeName.get(m.make_id)
    return make
      ? [{ id: m.id, make, model: m.name, label: `${make} ${m.name}`, vehicleClass: m.vehicle_class as string }]
      : []
  })

  const pricesByService = new Map<string, Record<string, number>>()
  for (const p of prices) {
    const n = Number(p.base_price)
    if (!(n > 0)) continue
    const row = pricesByService.get(p.service_id) ?? {}
    row[p.vehicle_class] = n
    pricesByService.set(p.service_id, row)
  }

  return {
    vehicles,
    services: services
      .filter((s) => !s.coming_soon && pricesByService.has(s.id))
      .map((s) => ({ id: s.id, name: s.name, prices: pricesByService.get(s.id)! })),
    quickPicks: QUICK_PICKS,
  }
}
