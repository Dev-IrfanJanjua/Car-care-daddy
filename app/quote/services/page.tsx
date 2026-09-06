import { redirect } from 'next/navigation'
import { getServiceCatalog } from '@/lib/pricing/service-catalog'
import { ServiceSelector } from './service-selector'
import type { Database } from '@/lib/types/database.types'
import { QuoteShell } from '@/components/quote/quote-shell'

type VehicleClass = Database['public']['Enums']['vehicle_class']

export default async function ServicesStepPage({
  searchParams,
}: {
  searchParams: Promise<{
    make?: string
    model?: string
    year?: string
    class?: string
    services?: string
  }>
}) {
  const { make, model, year, class: vehicleClass, services: preselected } = await searchParams

  if (!make || !model || !year || !vehicleClass) {
    redirect('/quote')
  }

  // Cached catalog, filtered to this vehicle class in memory -- see
  // lib/pricing/service-catalog.ts for why this is not queried per request.
  const { services, prices } = await getServiceCatalog()

  const priceByService = new Map(
    prices
      .filter((p) => p.vehicle_class === (vehicleClass as VehicleClass))
      .map((p) => [p.service_id, Number(p.base_price)])
  )
  const servicesWithPrice = services
    .filter((s) => priceByService.has(s.id))
    .map((s) => ({ ...s, price: priceByService.get(s.id)! }))

  const vehicleQuery = new URLSearchParams({ make, model, year, class: vehicleClass }).toString()

  return (
    <QuoteShell
      step={2}
      backHref={`/quote?${vehicleQuery}`}
      hrefs={[`/quote?${vehicleQuery}`]}
      title="Select your services"
      description={`${year} ${make} ${model}`}
    >
      <ServiceSelector
        services={servicesWithPrice}
        vehicleParams={{ make, model, year, class: vehicleClass }}
        initialSelectedIds={preselected ? preselected.split(',').filter(Boolean) : []}
      />
    </QuoteShell>
  )
}
