import { redirect } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { calculateQuote } from '@/lib/pricing/calculate-quote'
import { createQuoteAndContinue } from '@/lib/actions/quotes'
import type { Database } from '@/lib/types/database.types'
import { QuoteShell } from '@/components/quote/quote-shell'
import { formatPrice } from '@/lib/format'
import { EmailQuoteForm } from './email-quote-form'
import { FileDrop } from '@/components/ui/file-drop'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
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
      step={3}
      backHref={`/quote/services?${servicesQuery}`}
      hrefs={[`/quote?${vehicleQuery}`, `/quote/services?${servicesQuery}`]}
      title="Your quote"
      description={`${year} ${make} ${model}`}
    >
      <ul className="space-y-2.5">
        {quote.lineItems.map((item) => (
          <li key={item.serviceId} className="flex justify-between text-sm">
            <span>{item.name}</span>
            <span className="tabular-nums">{formatPrice(item.price)}</span>
          </li>
        ))}
      </ul>

      <Separator className="my-4" />

      <div className="flex items-center justify-between rounded-lg bg-brand/5 px-4 py-3">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-lg font-bold tabular-nums text-brand">
          {formatPrice(quote.total)}
        </span>
      </div>

      <form action={createQuoteAndContinue} className="mt-8 space-y-4">
        <input type="hidden" name="make" value={make} />
        <input type="hidden" name="model" value={model} />
        <input type="hidden" name="year" value={year} />
        <input type="hidden" name="class" value={vehicleClass} />
        <input type="hidden" name="services" value={services} />

        <div className="space-y-1.5">
          <Label htmlFor="photos">Add photos of the damage (optional)</Label>
          <FileDrop id="photos" name="photos" />
          <p className="text-xs text-muted-foreground">
            Helps your technician prep before they arrive.
          </p>
        </div>

        <Button type="submit" size="lg" className="h-11 w-full text-base">
          Continue to booking
          <ArrowRight className="size-4" data-icon="inline-end" />
        </Button>
      </form>

      <details className="mt-6 group">
        <summary className="cursor-pointer text-sm text-muted-foreground marker:content-none">
          <span className="inline-block transition-transform group-open:rotate-90">›</span>{' '}
          Email me this quote instead
        </summary>
        <EmailQuoteForm
          make={make}
          model={model}
          year={year}
          vehicleClass={vehicleClass}
          services={services}
        />
      </details>
    </QuoteShell>
  )
}
