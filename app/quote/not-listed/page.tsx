import { QuoteShell, VehicleTypePicker } from '@/features/booking'

export const metadata = { title: 'Choose your car type' }

export default async function VehicleNotListedPage({
  searchParams,
}: {
  searchParams: Promise<{ services?: string; bundle?: string; type?: string }>
}) {
  const { services, bundle, type } = await searchParams
  return (
    <QuoteShell
      backHref="/quote"
      title="Choose your car type"
      description="Can't find your car? Pick the body type closest to it and you'll get the same price."
    >
      <VehicleTypePicker initialServices={services} initialBundle={bundle} initialType={type} />
    </QuoteShell>
  )
}
