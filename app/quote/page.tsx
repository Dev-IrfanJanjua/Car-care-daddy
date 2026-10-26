import { getServiceCatalog } from '@/lib/pricing/service-catalog'
import { getBundles } from '@/features/bundles'
import { getBusinessContact } from '@/lib/business-contact'
import { getPriceFinderData } from '@/features/price-finder/lib/get-price-finder-data'
import { ServiceStep, type StepService } from '@/features/booking'

type Params = {
  make?: string
  model?: string
  year?: string
  class?: string
  services?: string
  bundle?: string
}

/**
 * Step 1 of the booking flow: car type + year + service(s) on one screen. The
 * old "Get an instant quote" form and its separate services page are gone --
 * links that still point at /quote?make=…&services=… or /quote/services open
 * this page with those choices filled in.
 */
export default async function QuotePage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams

  const [{ services, prices }, bundles, contact, finder] = await Promise.all([
    getServiceCatalog(),
    getBundles(),
    getBusinessContact(),
    getPriceFinderData(),
  ])

  const stepServices: StepService[] = services.map((s) => {
    const byClass: Record<string, number> = {}
    for (const p of prices) {
      const n = Number(p.base_price)
      if (p.service_id === s.id && n > 0) byClass[p.vehicle_class] = n
    }
    return {
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      is_package: s.is_package,
      coming_soon: s.coming_soon,
      exclusive_group: s.exclusive_group,
      prices: byClass,
    }
  })
  // A service nobody can buy yet is kept only when flagged coming soon.
  const listed = stepServices.filter((s) => s.coming_soon || Object.keys(s.prices).length > 0)

  return (
    <ServiceStep
      vehicles={finder.vehicles}
      quickPicks={finder.quickPicks}
      services={listed}
      bundles={bundles.map((b) => ({ id: b.id, name: b.name, percent: b.discountPercent, serviceIds: b.serviceIds }))}
      initial={{
        make: params.make,
        model: params.model,
        year: params.year,
        vehicleClass: params.class,
        services: params.services,
        bundle: params.bundle,
      }}
      phone={{ display: contact.whatsappDisplay, telHref: `tel:+${contact.whatsappNumber}`, whatsappUrl: contact.whatsappUrl }}
    />
  )
}
