import { VEHICLE_CLASSES } from '@/lib/vehicles/classes'
import type { Bundle } from './get-bundles'

type CatalogService = { id: string; name: string; coming_soon: boolean }
type CatalogPrice = { service_id: string; vehicle_class: string; base_price: number | string }

export type PricedBundle = Bundle & {
  /** names of the services inside, in catalog order */
  items: string[]
  /** a bundle holding a service that is on hold can't be sold yet */
  comingSoon: boolean
  /** cheapest car type: full price of the parts, and the bundle price after the discount */
  fromFull: number | null
  from: number | null
}

/** Price of a set of services for one car type, before any discount; null if any part has no price. */
export function sumFor(serviceIds: string[], vehicleClass: string, prices: CatalogPrice[]) {
  let total = 0
  for (const id of serviceIds) {
    const p = prices.find((x) => x.service_id === id && x.vehicle_class === vehicleClass)
    if (!p || !(Number(p.base_price) > 0)) return null
    total += Number(p.base_price)
  }
  return total
}

export function applyDiscount(amount: number, percent: number) {
  return Math.round(amount * (1 - percent / 100))
}

/** Bundles whose parts all exist in the catalog, with their "from" price worked out. */
export function priceBundles(bundles: Bundle[], services: CatalogService[], prices: CatalogPrice[]): PricedBundle[] {
  return bundles.flatMap((b) => {
    // catalog order (windshield, glass, headlights, …), whatever order they were saved in
    const parts = services.filter((s) => b.serviceIds.includes(s.id))
    if (parts.length === 0 || parts.length !== b.serviceIds.length) return []
    const comingSoon = parts.some((s) => s.coming_soon)
    const totals = comingSoon
      ? []
      : VEHICLE_CLASSES.map((c) => sumFor(b.serviceIds, c, prices)).filter((n): n is number => n != null)
    const fromFull = totals.length ? Math.min(...totals) : null
    return [
      {
        ...b,
        items: parts.map((s) => s.name),
        comingSoon,
        fromFull,
        from: fromFull != null ? applyDiscount(fromFull, b.discountPercent) : null,
      },
    ]
  })
}
