import { createClient } from '@/lib/supabase/server'
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
export async function calculateQuote(
  vehicleClass: VehicleClass,
  serviceIds: string[]
): Promise<QuoteResult> {
  if (serviceIds.length === 0) {
    return { lineItems: [], subtotal: 0, discount: 0, total: 0 }
  }

  const supabase = await createClient()

  const [{ data: services, error: servicesError }, { data: prices, error: pricesError }] =
    await Promise.all([
      supabase.from('services').select('id, name, is_active').in('id', serviceIds),
      supabase
        .from('service_prices')
        .select('service_id, base_price')
        .eq('vehicle_class', vehicleClass)
        .in('service_id', serviceIds),
    ])

  if (servicesError) throw servicesError
  if (pricesError) throw pricesError

  const priceByService = new Map((prices ?? []).map((p) => [p.service_id, Number(p.base_price)]))

  const lineItems: QuoteLineItem[] = (services ?? [])
    .filter((s) => s.is_active && priceByService.has(s.id))
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
