import { redirect } from 'next/navigation'
import { BookingForm } from './booking-form'

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
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold">Book your appointment</h1>
      <p className="mt-2 text-muted-foreground">
        {year} {make} {model} &middot; ${Number(total).toFixed(2)}
      </p>
      <BookingForm
        quoteId={quoteId}
        make={make}
        model={model}
        year={year}
        vehicleClass={vehicleClass}
        services={services}
      />
    </main>
  )
}
