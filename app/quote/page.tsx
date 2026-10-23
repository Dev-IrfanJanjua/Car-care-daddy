import { getVehicleCatalog } from '@/lib/vehicles/get-catalog'
import { VehicleStep } from './vehicle-step'
import { QuoteShell } from '@/components/quote/quote-shell'

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ make?: string; model?: string; year?: string; services?: string }>
}) {
  const { make, model, year, services } = await searchParams
  const { makes, models } = await getVehicleCatalog()

  return (
    <QuoteShell
      backHref="/"
      title="Get an instant quote"
      description="Tell us about your vehicle to see transparent pricing."
    >
      <VehicleStep makes={makes} models={models} initialMake={make} initialModel={model} initialYear={year} initialServices={services} />
    </QuoteShell>
  )
}
