import Link from 'next/link'
import { CircleCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatAppointment, formatPrice } from '@/lib/format'
import { WHATSAPP_URL } from '@/lib/contact'

export type BookingSummary = {
  customer_name: string
  vehicle_make: string
  vehicle_model: string
  scheduled_at: string
  total_amount: number | string
  service_address: string
  service_city: string
}

/**
 * Presentation only -- kept apart from the page so the confirmation screen can
 * be rendered and reviewed without creating a real booking.
 */
export function BookingSuccessCard({ booking }: { booking: BookingSummary }) {
  const rows = [
    { label: 'Vehicle', value: `${booking.vehicle_make} ${booking.vehicle_model}` },
    { label: 'Where', value: `${booking.service_address}, ${booking.service_city}` },
    { label: 'When', value: formatAppointment(booking.scheduled_at) },
  ]

  return (
    <Card className="relative shadow-xl shadow-navy-900/6 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-linear-to-r before:from-gold-700 before:via-gold-400 before:to-gold-700">
      <CardContent className="py-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-linear-to-br from-navy-700 to-navy-950 ring-1 ring-gold-hairline">
            <CircleCheck className="size-7 text-gold" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">
            You&apos;re all set, {booking.customer_name.split(' ')[0]}!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your booking is confirmed. We&apos;ve emailed you the details.
          </p>
        </div>

        <dl className="mt-7 divide-y divide-border/60 border-y border-border/60 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-6 py-3">
              <dt className="shrink-0 text-muted-foreground">{row.label}</dt>
              <dd className="text-right font-medium">{row.value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-6 py-3">
            <dt className="text-muted-foreground">Total</dt>
            <dd className="text-lg font-bold text-gold-ink tabular-nums">
              {formatPrice(Number(booking.total_amount))}
            </dd>
          </div>
        </dl>

        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <Button className="h-11 flex-1" render={<Link href="/" />}>
            Back to home
          </Button>
          <Button
            variant="outline"
            className="h-11 flex-1"
            render={<a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" />}
          >
            Message us on WhatsApp
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
