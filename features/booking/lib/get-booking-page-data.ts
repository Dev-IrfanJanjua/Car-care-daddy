import { getServiceCatalog } from '@/lib/pricing/service-catalog'
import { calculateQuote } from '@/lib/pricing/calculate-quote'
import { getBusinessContact } from '@/lib/business-contact'
import { getBookedTimes } from './get-booked-times'
import { getBundles } from '@/features/bundles'
import type { Database } from '@/lib/types/database.types'

type VehicleClass = Database['public']['Enums']['vehicle_class']

export type BookingSearchParams = {
  make?: string
  model?: string
  year?: string
  class?: string
  services?: string
  bundle?: string
}

/**
 * Everything the booking wizard needs, or null when the URL does not describe a
 * bookable order (the page then sends the customer back to /quote).
 *
 * Totals are recomputed server-side here rather than trusted from the URL -- the
 * pricing engine stays the single source of truth.
 */
export async function getBookingPageData({
  make,
  model,
  year,
  class: vehicleClass,
  services,
  bundle,
}: BookingSearchParams) {
  if (!make || !model || !year || !vehicleClass || !services) return null

  const selectedIds = services.split(',').filter(Boolean)

  const [quote, { services: allServices, prices }, contact, bookedTimes, allBundles] = await Promise.all([
    calculateQuote(vehicleClass as VehicleClass, selectedIds, bundle),
    getServiceCatalog(),
    getBusinessContact(),
    getBookedTimes(),
    getBundles(),
  ])

  if (quote.lineItems.length === 0) return null

  const priceByService = new Map(
    prices
      .filter((p) => p.vehicle_class === (vehicleClass as VehicleClass))
      .map((p) => [p.service_id, Number(p.base_price)])
  )

  // Every sellable service for this car type. The confirmation step lets the
  // customer add to, swap within, or bundle these; alternatives in an exclusive
  // group replace each other there, so nothing here needs pre-filtering. A
  // coming-soon service has no sellable price and is left out.
  const upsells = allServices
    .filter((s) => !s.coming_soon && priceByService.has(s.id))
    .map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price: priceByService.get(s.id)!,
      exclusiveGroup: s.exclusive_group,
    }))

  // Bundles the customer could switch to on the confirmation step: every part
  // must be sellable for this car type. (The server re-derives the discount from
  // the chosen services when the booking is made.)
  const bundleOptions = allBundles
    .filter(
      (b) =>
        b.discountPercent > 0 &&
        b.serviceIds.length > 1 &&
        b.serviceIds.every((id) => allServices.some((s) => s.id === id && !s.coming_soon) && priceByService.has(id))
    )
    .map((b) => ({ id: b.id, name: b.name, badge: b.badge, percent: b.discountPercent, serviceIds: b.serviceIds }))

  const servicesQuery = new URLSearchParams({ make, model, year, class: vehicleClass, services, ...(bundle ? { bundle } : {}) }).toString()

  return {
    make,
    model,
    year,
    vehicleClass,
    services,
    lineItems: quote.lineItems,
    total: quote.total,
    subtotal: quote.subtotal,
    discount: quote.discount,
    bundle: quote.discount > 0 ? bundle ?? '' : '',
    upsells,
    bundleOptions,
    servicesBackHref: `/quote?${servicesQuery}`,
    phone: { display: contact.whatsappDisplay, telHref: `tel:+${contact.whatsappNumber}`, whatsappUrl: contact.whatsappUrl },
    hours: contact.hours,
    bookedTimes,
  }
}
