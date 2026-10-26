import { getServiceCatalog } from './service-catalog'
import { getBundles, applyDiscount } from '@/features/bundles'
import type { Database } from '@/lib/types/database.types'

type VehicleClass = Database['public']['Enums']['vehicle_class']

export type QuoteLineItem = {
  serviceId: string
  name: string
  /** what the customer pays for this line (bundle discount already applied) */
  price: number
  /** list price, only when a bundle discount lowered `price` */
  originalPrice?: number
}

export type QuoteResult = {
  lineItems: QuoteLineItem[]
  subtotal: number
  discount: number
  total: number
}

// Server-side only, single source of truth for pricing. Called at both quote
// creation and booking creation -- never trust a client-submitted total.
//
// Reads the cached catalog and filters in memory rather than querying per
// request. The rows are few and change only on an admin edit, which revalidates
// the cache tag -- so a price change still takes effect immediately, and the
// booking path no longer waits on a database round trip to price an order.
export async function calculateQuote(
  vehicleClass: VehicleClass,
  serviceIds: string[],
  bundleId?: string | null
): Promise<QuoteResult> {
  if (serviceIds.length === 0) {
    return { lineItems: [], subtotal: 0, discount: 0, total: 0 }
  }

  const { services, prices } = await getServiceCatalog()

  const wanted = new Set(serviceIds)
  const priceByService = new Map(
    prices
      .filter((p) => p.vehicle_class === vehicleClass && wanted.has(p.service_id))
      .map((p) => [p.service_id, Number(p.base_price)])
  )

  const lineItems: QuoteLineItem[] = services
    // is_active is already filtered by the catalog query; kept explicit so the
    // guarantee does not depend on how that query happens to be written.
    //
    // coming_soon is dropped here, not just hidden in the picker: those rows
    // still carry a placeholder price of 0, so a hand-crafted ?services= URL
    // would otherwise add an unbookable service to a real order for free.
    .filter((s) => wanted.has(s.id) && s.is_active && !s.coming_soon && priceByService.has(s.id))
    .map((s) => ({
      serviceId: s.id,
      name: s.name,
      price: priceByService.get(s.id)!,
    }))

  // A bundle's percentage applies to its own services, and only when every one
  // of them is in the order and sellable. It is re-derived here from the
  // bundles table, never taken from the client: the id is the only input.
  if (bundleId) {
    const bundle = (await getBundles()).find((b) => b.id === bundleId)
    const have = new Map(lineItems.map((l) => [l.serviceId, l]))
    if (bundle && bundle.discountPercent > 0 && bundle.serviceIds.length > 0 && bundle.serviceIds.every((id) => have.has(id))) {
      const parts = bundle.serviceIds.map((id) => have.get(id)!)
      const listTotal = parts.reduce((sum, l) => sum + l.price, 0)
      const discountedTotal = applyDiscount(listTotal, bundle.discountPercent)
      // Round each line, then put any rounding remainder on the last one so the
      // lines add up to exactly the discounted bundle total.
      let allocated = 0
      parts.forEach((l, i) => {
        const orig = l.price
        const next = i === parts.length - 1 ? discountedTotal - allocated : applyDiscount(orig, bundle.discountPercent)
        allocated += next
        l.originalPrice = orig
        l.price = next
      })
    }
  }

  const total = lineItems.reduce((sum, item) => sum + item.price, 0)
  const listSubtotal = lineItems.reduce((sum, item) => sum + (item.originalPrice ?? item.price), 0)
  const discount = listSubtotal - total

  return { lineItems, subtotal: listSubtotal, discount, total }
}
