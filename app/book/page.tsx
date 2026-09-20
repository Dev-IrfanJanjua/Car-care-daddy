import { redirect } from 'next/navigation'
import { BookingWizard } from './booking-wizard'
import { getServiceCatalog } from '@/lib/pricing/service-catalog'
import { calculateQuote } from '@/lib/pricing/calculate-quote'
import { getBusinessContact } from '@/lib/business-contact'
import type { Database } from '@/lib/types/database.types'

type VehicleClass = Database['public']['Enums']['vehicle_class']

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { make, model, year, class: vehicleClass, services } = await searchParams

  if (!make || !model || !year || !vehicleClass || !services) {
    redirect('/quote')
  }

  const selectedIds = services.split(',').filter(Boolean)

  // Recomputed here rather than trusting a `total` query param -- the services
  // step no longer passes one (the standalone "review your quote" screen that
  // used to own that job is gone), and a client-supplied total was never
  // trusted anyway.
  const [quote, { services: allServices, prices }, contact] = await Promise.all([
    calculateQuote(vehicleClass as VehicleClass, selectedIds),
    getServiceCatalog(),
    getBusinessContact(),
  ])

  if (quote.lineItems.length === 0) {
    redirect('/quote')
  }

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

  const servicesQuery = new URLSearchParams({
    make,
    model,
    year,
    class: vehicleClass,
    services,
  }).toString()

  return (
    <BookingWizard
      make={make}
      model={model}
      year={year}
      vehicleClass={vehicleClass}
      services={services}
      lineItems={quote.lineItems}
      total={quote.total}
      upsells={upsells}
      servicesBackHref={`/quote/services?${servicesQuery}`}
      phone={{ display: contact.whatsappDisplay, telHref: `tel:+${contact.whatsappNumber}` }}
      hours={contact.hours}
    />
  )
}
