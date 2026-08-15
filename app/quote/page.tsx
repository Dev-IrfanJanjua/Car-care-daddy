import { getVehicleCatalog } from '@/lib/vehicles/get-catalog'
import { VehicleStep } from './vehicle-step'

export default async function QuotePage() {
  const { makes, models } = await getVehicleCatalog()

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold">Get an instant quote</h1>
      <p className="mt-2 text-muted-foreground">
        Tell us about your vehicle to see transparent pricing.
      </p>
      <VehicleStep makes={makes} models={models} />
    </main>
  )
}
