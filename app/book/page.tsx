import { redirect } from 'next/navigation'
import { BookingWizard, getBookingPageData, type BookingSearchParams } from '@/features/booking'

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<BookingSearchParams>
}) {
  const data = await getBookingPageData(await searchParams)
  if (!data) redirect('/quote')

  return <BookingWizard {...data} />
}
