import { redirect } from 'next/navigation'
import { calculateQuote } from '@/lib/pricing/calculate-quote'
import { createQuoteAndContinue, captureQuoteLead } from '@/lib/actions/quotes'
import type { Database } from '@/lib/types/database.types'
import { QuoteProgress } from '@/components/quote-progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type VehicleClass = Database['public']['Enums']['vehicle_class']

export default async function QuoteSummaryPage({
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
  const { make, model, year, class: vehicleClass, services } = await searchParams

  if (!make || !model || !year || !vehicleClass || !services) {
    redirect('/quote')
  }

  const serviceIds = services.split(',').filter(Boolean)
  const quote = await calculateQuote(vehicleClass as VehicleClass, serviceIds)

  if (quote.lineItems.length === 0) {
    redirect('/quote')
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12">
      <QuoteProgress step={3} />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Your quote</CardTitle>
          <p className="text-sm text-muted-foreground">
            {year} {make} {model}
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {quote.lineItems.map((item) => (
              <li key={item.serviceId} className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span className="tabular-nums">${item.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-bold tabular-nums">${quote.total.toFixed(2)}</span>
          </div>

          <form action={createQuoteAndContinue} className="mt-8 space-y-4">
            <input type="hidden" name="make" value={make} />
            <input type="hidden" name="model" value={model} />
            <input type="hidden" name="year" value={year} />
            <input type="hidden" name="class" value={vehicleClass} />
            <input type="hidden" name="services" value={services} />

            <div className="space-y-1.5">
              <Label htmlFor="photos">Add photos of the damage (optional)</Label>
              <Input id="photos" name="photos" type="file" accept="image/*" multiple />
              <p className="text-xs text-muted-foreground">
                Helps your technician prep before they arrive.
              </p>
            </div>

            <Button type="submit" className="w-full">
              Continue to booking
            </Button>
          </form>

          <details className="mt-6 group">
            <summary className="cursor-pointer text-sm text-muted-foreground marker:content-none">
              <span className="inline-block transition-transform group-open:rotate-90">›</span>{' '}
              Email me this quote instead
            </summary>
            <form action={captureQuoteLead} className="mt-4 space-y-3">
              <input type="hidden" name="make" value={make} />
              <input type="hidden" name="model" value={model} />
              <input type="hidden" name="year" value={year} />
              <input type="hidden" name="services" value={services} />
              <input type="hidden" name="total" value={quote.total} />
              <Input name="fullName" placeholder="Full name" />
              <Input name="email" type="email" placeholder="Email" required />
              <Input name="phone" type="tel" placeholder="Phone (optional)" />
              <Button type="submit" variant="outline" className="w-full">
                Email my quote
              </Button>
            </form>
          </details>
        </CardContent>
      </Card>
    </main>
  )
}
