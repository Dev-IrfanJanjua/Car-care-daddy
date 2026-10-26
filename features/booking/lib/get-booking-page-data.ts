import { getServiceCatalog } from '@/lib/pricing/service-catalog'
import { calculateQuote } from '@/lib/pricing/calculate-quote'
import { getBusinessContact } from '@/lib/business-contact'
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

  const [quote, { services: allServices, prices }, contact] = await Promise.all([
    calculateQuote(vehicleClass as VehicleClass, selectedIds, bundle),
    getServiceCatalog(),
    getBusinessContact(),
  ])

  if (quote.lineItems.length === 0) return null

  const priceByService = new Map(
    prices
      .filter((p) => p.vehicle_class === (vehicleClass as VehicleClass))
      .map((p) => [p.service_id, Number(p.base_price)])
  )

  // Groups the customer has already chosen from. Their alternatives must not
  // appear here: this control only adds to the total, so offering the other
  // glass treatment would rebuild, through the upsell, the double-charge the
  // picker refuses to allow.
  const chosenGroups = new Set(
    allServices
      .filter((s) => selectedIds.includes(s.id) && s.exclusive_group)
      .map((s) => s.exclusive_group)
  )

  const upsells = allServices
    // coming_soon is excluded here as well as in the picker -- it has no
    // sellable price, so offering it would produce a free line item.
    .filter(
      (s) =>
        !s.coming_soon &&
        !selectedIds.includes(s.id) &&
        !(s.exclusive_group && chosenGroups.has(s.exclusive_group)) &&
        priceByService.has(s.id)
    )
    .map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price: priceByService.get(s.id)!,
    }))

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
    servicesBackHref: `/quote/services?${servicesQuery}`,
    phone: { display: contact.whatsappDisplay, telHref: `tel:+${contact.whatsappNumber}` },
    hours: contact.hours,
  }
}
