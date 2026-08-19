import { redirect } from 'next/navigation'
import { BookingForm } from './booking-form'
import { QuoteProgress } from '@/components/quote-progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { quoteId, make, model, year, class: vehicleClass, services, total } = await searchParams

  if (!make || !model || !year || !vehicleClass || !services || !total) {
    redirect('/quote')
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12">
      <QuoteProgress step={4} />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Book your appointment</CardTitle>
          <p className="text-sm text-muted-foreground">
            {year} {make} {model} &middot; ${Number(total).toFixed(2)}
          </p>
        </CardHeader>
        <CardContent>
          <BookingForm
            quoteId={quoteId}
            make={make}
            model={model}
            year={year}
            vehicleClass={vehicleClass}
            services={services}
          />
        </CardContent>
      </Card>
    </main>
  )
}
