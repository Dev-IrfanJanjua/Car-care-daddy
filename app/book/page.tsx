import { redirect } from 'next/navigation'
import { BookingForm } from './booking-form'
import { QuoteShell } from '@/components/quote/quote-shell'

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { quoteId, make, model, year, class: vehicleClass, services, total } = await searchParams

  if (!make || !model || !year || !vehicleClass || !services || !total) {
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
      step={4}
      backHref={`/quote/summary?${servicesQuery}`}
      hrefs={[`/quote?${vehicleQuery}`, `/quote/services?${servicesQuery}`, `/quote/summary?${servicesQuery}`]}
      title="Book your appointment"
      description={`${year} ${make} ${model} · $${Number(total).toFixed(2)}`}
    >
      <BookingForm
        quoteId={quoteId}
        make={make}
        model={model}
        year={year}
        vehicleClass={vehicleClass}
        services={services}
      />
    </QuoteShell>
  )
}
