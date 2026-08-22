'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { CalendarClock, CircleCheck, MapPin, User } from 'lucide-react'
import { createBooking } from '@/lib/actions/bookings'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// useFormStatus resets itself when the action settles, including on error --
// the previous manual `pending` state was never cleared, so a failed booking
// left the button reading "Booking…" forever.
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} size="lg" className="h-11 w-full text-base">
      {pending ? (
        'Booking…'
      ) : (
        <>
          <CircleCheck className="size-4" data-icon="inline-start" />
          Confirm booking
        </>
      )}
    </Button>
  )
}

// <input type="datetime-local"> yields a zoneless "2026-09-01T10:00". Parsing
// that on the server resolves it in the server's zone (UTC on Vercel), which
// shifted every appointment by the customer's offset. Parsing it here, in the
// browser, resolves it in the customer's own zone -- so we send an unambiguous
// UTC instant instead.
function localMinValue() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}`
}

export function BookingForm(props: {
  quoteId?: string
  make: string
  model: string
  year: string
  vehicleClass: string
  services: string
}) {
  const [localWhen, setLocalWhen] = useState('')

  const parsed = localWhen ? new Date(localWhen) : null
  const scheduledAtUtc =
    parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : ''

  return (
    <form action={createBooking} className="space-y-7">
      <input type="hidden" name="quoteId" value={props.quoteId ?? ''} />
      <input type="hidden" name="make" value={props.make} />
      <input type="hidden" name="model" value={props.model} />
      <input type="hidden" name="year" value={props.year} />
      <input type="hidden" name="class" value={props.vehicleClass} />
      <input type="hidden" name="services" value={props.services} />
      <input type="hidden" name="scheduledAt" value={scheduledAtUtc} />

      <fieldset className="space-y-3">
        <legend className="mb-2 flex items-center gap-1.5 font-semibold">
          <User className="size-4 text-brand" />
          Your contact info
        </legend>
        <Input name="customerName" placeholder="Full name" className="h-11" required />
        <Input name="customerEmail" type="email" placeholder="Email" className="h-11" required />
        <Input name="customerPhone" type="tel" placeholder="Phone" className="h-11" required />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 flex items-center gap-1.5 font-semibold">
          <MapPin className="size-4 text-brand" />
          Where should we come?
        </legend>
        <Input name="serviceAddress" placeholder="Street address" className="h-11" required />
        <div className="flex gap-3">
          <Input name="serviceCity" placeholder="City" className="h-11" required />
          <Input name="serviceZip" placeholder="ZIP" required className="h-11 w-32" />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 flex items-center gap-1.5 font-semibold">
          <CalendarClock className="size-4 text-brand" />
          When works best?
        </legend>
        <Input
          type="datetime-local"
          value={localWhen}
          onChange={(e) => setLocalWhen(e.target.value)}
          min={localMinValue()}
          className="h-11"
          aria-label="Appointment date and time"
          required
        />
        <p className="text-xs text-muted-foreground">
          Times are in your local timezone.
        </p>
      </fieldset>

      <SubmitButton />
    </form>
  )
}
