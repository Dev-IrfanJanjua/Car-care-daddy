import { getVehicleCatalog } from '@/lib/vehicles/get-catalog'
import { VehicleStep } from './vehicle-step'
import { QuoteProgress } from '@/components/quote-progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function QuotePage() {
  const { makes, models } = await getVehicleCatalog()

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12">
      <QuoteProgress step={1} />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Get an instant quote</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tell us about your vehicle to see transparent pricing.
          </p>
        </CardHeader>
        <CardContent>
          <VehicleStep makes={makes} models={models} />
        </CardContent>
      </Card>
    </main>
  )
}
