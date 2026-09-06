'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CircleCheck, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatAppointment, formatPrice } from '@/lib/format'
import { orderWhatsAppUrl } from '@/lib/whatsapp/order-message'

export type BookingSummary = {
  id: string
  customer_name: string
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number | null
  scheduled_at: string
  total_amount: number | string
  service_address: string
  service_city: string
}

export type LineItem = { name: string; price: number }

/**
 * Two states on one screen. The booking row already exists by the time this
 * renders -- the WhatsApp step is the customer confirming it to the shop, not
 * the thing that creates it, so closing the tab here loses no order.
 *
 * The handoff is a real anchor the customer taps rather than a scripted
 * window.open: browsers block programmatic opens without a user gesture, and
 * assigning location.href would navigate away from this page entirely, leaving
 * them sitting on wa.me instead of their confirmation.
 */
export function BookingSuccessCard({
  booking,
  lineItems,
}: {
  booking: BookingSummary
  lineItems: LineItem[]
}) {
  const [sent, setSent] = useState(false)

  const firstName = booking.customer_name.split(' ')[0]
  const vehicle = [booking.vehicle_year, booking.vehicle_make, booking.vehicle_model]
    .filter(Boolean)
    .join(' ')

  const waUrl = orderWhatsAppUrl({
    bookingId: booking.id,
    customerName: booking.customer_name,
    vehicle,
    scheduledAt: booking.scheduled_at,
    serviceAddress: booking.service_address,
    serviceCity: booking.service_city,
    lineItems,
    totalAmount: Number(booking.total_amount),
  })

  const rows = [
    { label: 'Vehicle', value: vehicle },
    { label: 'Where', value: `${booking.service_address}, ${booking.service_city}` },
    { label: 'When', value: formatAppointment(booking.scheduled_at) },
  ]

  return (
    <Card className="relative shadow-xl shadow-navy-900/6 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-linear-to-r before:from-gold-700 before:via-gold-400 before:to-gold-700">
      <CardContent className="py-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-linear-to-br from-navy-700 to-navy-950 ring-1 ring-gold-hairline">
            {sent ? (
              <CircleCheck className="size-7 text-gold" />
            ) : (
              <MessageCircle className="size-7 text-gold" />
            )}
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">
            {sent ? `You're all set, ${firstName}!` : `Almost done, ${firstName}!`}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {sent
              ? "Order sent. We'll confirm your appointment on WhatsApp shortly."
              : 'Send us your order on WhatsApp to confirm your appointment.'}
          </p>
        </div>

        <dl className="mt-7 divide-y divide-border/60 border-y border-border/60 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-6 py-3">
              <dt className="shrink-0 text-muted-foreground">{row.label}</dt>
              <dd className="text-right font-medium">{row.value}</dd>
            </div>
          ))}
          {lineItems.map((item) => (
            <div key={item.name} className="flex items-start justify-between gap-6 py-3">
              <dt className="shrink-0 text-muted-foreground">{item.name}</dt>
              <dd className="text-right font-medium tabular-nums">{formatPrice(item.price)}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-6 py-3">
            <dt className="text-muted-foreground">Total</dt>
            <dd className="text-lg font-bold text-gold-ink tabular-nums">
              {formatPrice(Number(booking.total_amount))}
            </dd>
          </div>
        </dl>

        {sent ? (
          <div className="mt-7 flex flex-col gap-2 sm:flex-row">
            <Button className="h-11 flex-1" render={<Link href="/" />}>
              Back to home
            </Button>
            <Button
              variant="outline"
              className="h-11 flex-1"
              render={<a href={waUrl} target="_blank" rel="noopener noreferrer" />}
            >
              Open WhatsApp again
            </Button>
          </div>
        ) : (
          <div className="mt-7 flex flex-col items-center gap-3">
            <Button
              className="h-12 w-full text-base"
              onClick={() => setSent(true)}
              render={<a href={waUrl} target="_blank" rel="noopener noreferrer" />}
            >
              <MessageCircle className="size-5" data-icon="inline-start" />
              Send order on WhatsApp
            </Button>
            {/* Escape hatch for anyone who sent from another device, or whose
                browser refused to open the app -- they still reach the
                confirmed state instead of being stuck on this screen. */}
            <button
              type="button"
              onClick={() => setSent(true)}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              I&apos;ve already sent it
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
