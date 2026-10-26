import { getVehicleCatalog } from '@/lib/vehicles/get-catalog'
import { VehicleStep, QuoteShell } from '@/features/booking'

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ make?: string; model?: string; year?: string; services?: string; bundle?: string }>
}) {
  const { make, model, year, services, bundle } = await searchParams
  const { makes, models } = await getVehicleCatalog()

  return (
    <QuoteShell
      backHref="/"
      title="Get an instant quote"
      description="Tell us about your vehicle to see transparent pricing."
    >
      <VehicleStep makes={makes} models={models} initialMake={make} initialModel={model} initialYear={year} initialServices={services} initialBundle={bundle} />
    </QuoteShell>
  )
}
