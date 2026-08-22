import { getVehicleCatalog } from '@/lib/vehicles/get-catalog'
import { VehicleStep } from './vehicle-step'
import { QuoteShell } from '@/components/quote/quote-shell'

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ make?: string; model?: string; year?: string }>
}) {
  const { make, model, year } = await searchParams
  const { makes, models } = await getVehicleCatalog()

  return (
    <QuoteShell
      step={1}
      backHref="/"
      title="Get an instant quote"
      description="Tell us about your vehicle to see transparent pricing."
    >
      <VehicleStep makes={makes} models={models} initialMake={make} initialModel={model} initialYear={year} />
    </QuoteShell>
  )
}
