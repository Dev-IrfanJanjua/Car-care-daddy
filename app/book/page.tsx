import { redirect } from 'next/navigation'
import { BookingForm } from './booking-form'
import { QuoteShell } from '@/components/quote/quote-shell'
import { getServiceCatalog } from '@/lib/pricing/service-catalog'
import type { Database } from '@/lib/types/database.types'

type VehicleClass = Database['public']['Enums']['vehicle_class']

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { quoteId, make, model, year, class: vehicleClass, services, total } = await searchParams

  if (!make || !model || !year || !vehicleClass || !services || !total) {
    redirect('/quote')
  }

  // Last-chance upsell: everything bookable the customer has not already picked.
  // coming_soon is excluded here as well as in the picker -- it has no sellable
  // price, so offering it would produce a free line item.
  const selectedIds = services.split(',').filter(Boolean)
  const { services: allServices, prices } = await getServiceCatalog()

  const priceByService = new Map(
    prices
      .filter((p) => p.vehicle_class === (vehicleClass as VehicleClass))
      .map((p) => [p.service_id, Number(p.base_price)])
  )

  // A package already contains the individual services, so once one is chosen
  // there is nothing left to add -- offering them here would rebuild, through
  // the upsell, the double-charge the picker refuses to allow.
  const packageChosen = allServices.some((s) => s.is_package && selectedIds.includes(s.id))

  const upsells = packageChosen
    ? []
    : allServices
        // Packages are never upsells: they replace a selection rather than add
        // to it, and this control only ever adds a price to the running total.
        // coming_soon is excluded too -- it has no sellable price, so offering
        // it would produce a free line item.
        .filter(
          (s) =>
            !s.is_package &&
            !s.coming_soon &&
            !selectedIds.includes(s.id) &&
            priceByService.has(s.id)
        )
        .map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          price: priceByService.get(s.id)!,
        }))

  const vehicleQuery = new URLSearchParams({ make, model, year, class: vehicleClass }).toString()
  const servicesQuery = new URLSearchParams({
    make,
    model,
    year,
    class: vehicleClass,
    services,
  }).toString()

  return (
    <QuoteShell
      step={4}
      backHref={`/quote/summary?${servicesQuery}`}
      hrefs={[
        `/quote?${vehicleQuery}`,
        `/quote/services?${servicesQuery}`,
        `/quote/summary?${servicesQuery}`,
      ]}
      title="Book your appointment"
      // The vehicle and total now lead the form itself as a summary panel, so
      // repeating them here would just say the same thing twice.
      description="Tell us where and when, and we'll come to you."
    >
      <BookingForm
        quoteId={quoteId}
        make={make}
        model={model}
        year={year}
        vehicleClass={vehicleClass}
        services={services}
        total={Number(total)}
        upsells={upsells}
      />
    </QuoteShell>
  )
}
