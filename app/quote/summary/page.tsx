import { redirect } from 'next/navigation'
import { calculateQuote } from '@/lib/pricing/calculate-quote'
import { createQuoteAndContinue, captureQuoteLead } from '@/lib/actions/quotes'
import type { Database } from '@/lib/types/database.types'

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
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold">Your quote</h1>
      <p className="mt-2 text-muted-foreground">
        {year} {make} {model}
      </p>

      <ul className="mt-6 space-y-2">
        {quote.lineItems.map((item) => (
          <li key={item.serviceId} className="flex justify-between">
            <span>{item.name}</span>
            <span>${item.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-lg font-bold">${quote.total.toFixed(2)}</span>
      </div>

      <form action={createQuoteAndContinue} className="mt-8 space-y-4">
        <input type="hidden" name="make" value={make} />
        <input type="hidden" name="model" value={model} />
        <input type="hidden" name="year" value={year} />
        <input type="hidden" name="class" value={vehicleClass} />
        <input type="hidden" name="services" value={services} />

        <div>
          <label htmlFor="photos" className="block text-sm font-medium">
            Add photos of the damage (optional)
          </label>
          <input
            id="photos"
            name="photos"
            type="file"
            accept="image/*"
            multiple
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Helps your technician prep before they arrive.
          </p>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-brand px-4 py-2.5 font-semibold text-brand-foreground"
        >
          Continue to booking
        </button>
      </form>

      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-muted-foreground">
          Email me this quote instead
        </summary>
        <form action={captureQuoteLead} className="mt-4 space-y-3">
          <input type="hidden" name="make" value={make} />
          <input type="hidden" name="model" value={model} />
          <input type="hidden" name="year" value={year} />
          <input type="hidden" name="services" value={services} />
          <input type="hidden" name="total" value={quote.total} />
          <input
            name="fullName"
            placeholder="Full name"
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
          <input
            name="phone"
            type="tel"
            placeholder="Phone (optional)"
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
          <button
            type="submit"
            className="w-full rounded-md border border-border px-4 py-2.5 font-semibold"
          >
            Email my quote
          </button>
        </form>
      </details>
    </main>
  )
}
