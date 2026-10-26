import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getServiceCatalog } from '@/lib/pricing/service-catalog'
import { getBundles } from '@/features/bundles'
import { getBusinessContact } from '@/lib/business-contact'
import { ServiceSelector, WizardShell } from '@/features/booking'
import type { Database } from '@/lib/types/database.types'
import { Button } from '@/components/ui/button'

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
    bundle?: string
  }>
}) {
  const { make, model, year, class: vehicleClass, services: preselected, bundle: bundleId } = await searchParams

  if (!make || !model || !year || !vehicleClass) {
    redirect('/quote')
  }

  // Cached catalog, filtered to this vehicle class in memory -- see
  // lib/pricing/service-catalog.ts for why this is not queried per request.
  const [{ services, prices }, contact, bundles] = await Promise.all([
    getServiceCatalog(),
    getBusinessContact(),
    getBundles(),
  ])

  const priceByService = new Map(
    prices
      .filter((p) => p.vehicle_class === (vehicleClass as VehicleClass))
      .map((p) => [p.service_id, Number(p.base_price)])
  )
  // A coming-soon service is listed without a price, so it is kept even though
  // its only price row is the 0 placeholder that makes it unsellable.
  const servicesWithPrice = services
    .filter((s) => s.coming_soon || priceByService.has(s.id))
    .map((s) => ({ ...s, price: priceByService.get(s.id) ?? 0 }))

  // A bundle opens the picker with its services ticked; the selector keeps the
  // discount only while all of them stay selected.
  const bundle = bundles.find((b) => b.id === bundleId)
  const bundleInfo =
    bundle && bundle.serviceIds.every((id) => priceByService.has(id) && services.find((s) => s.id === id && !s.coming_soon))
      ? { id: bundle.id, name: bundle.name, percent: bundle.discountPercent, serviceIds: bundle.serviceIds }
      : undefined

  const vehicleQuery = new URLSearchParams({ make, model, year, class: vehicleClass }).toString()

  return (
    <WizardShell
      currentStep={1}
      title="Select service"
      description={`${year} ${make === 'Other' ? '' : `${make} `}${model}`}
      phone={{ display: contact.whatsappDisplay, telHref: `tel:+${contact.whatsappNumber}` }}
      footer={
        // ServiceSelector carries its own "N selected / total / Next Step"
        // footer right under the list, where the running total already lives
        // -- duplicating a second Next button down here would just be two
        // controls doing the same thing. Back is enough in this bar.
        <Button variant="ghost" size="sm" render={<Link href={`/quote?${vehicleQuery}`} />}>
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Back
        </Button>
      }
    >
      <ServiceSelector
        services={servicesWithPrice}
        vehicleParams={{ make, model, year, class: vehicleClass }}
        initialSelectedIds={preselected ? preselected.split(',').filter(Boolean) : (bundleInfo?.serviceIds ?? [])}
        bundle={bundleInfo}
      />
    </WizardShell>
  )
}
