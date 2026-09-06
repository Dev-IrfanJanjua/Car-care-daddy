import { getServiceCatalog } from './service-catalog'
import type { Database } from '@/lib/types/database.types'

type VehicleClass = Database['public']['Enums']['vehicle_class']

export type QuoteLineItem = {
  serviceId: string
  name: string
  price: number
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
  serviceIds: string[]
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
    .filter((s) => wanted.has(s.id) && s.is_active && priceByService.has(s.id))
    .map((s) => ({
      serviceId: s.id,
      name: s.name,
      price: priceByService.get(s.id)!,
    }))

  const subtotal = lineItems.reduce((sum, item) => sum + item.price, 0)
  const discount = 0
  const total = subtotal - discount

  return { lineItems, subtotal, discount, total }
}
