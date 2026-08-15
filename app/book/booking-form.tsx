'use client'

import { useState } from 'react'
import { createBooking } from '@/lib/actions/bookings'

export function BookingForm(props: {
  quoteId?: string
  make: string
  model: string
  year: string
  vehicleClass: string
  services: string
}) {
  const [pending, setPending] = useState(false)

  return (
    <form action={createBooking} className="mt-8 space-y-6" onSubmit={() => setPending(true)}>
      <input type="hidden" name="quoteId" value={props.quoteId ?? ''} />
      <input type="hidden" name="make" value={props.make} />
      <input type="hidden" name="model" value={props.model} />
      <input type="hidden" name="year" value={props.year} />
      <input type="hidden" name="class" value={props.vehicleClass} />
      <input type="hidden" name="services" value={props.services} />

      <fieldset className="space-y-3">
        <legend className="mb-1 font-semibold">Your contact info</legend>
        <input
          name="customerName"
          placeholder="Full name"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2"
        />
        <input
          name="customerEmail"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2"
        />
        <input
          name="customerPhone"
          type="tel"
          placeholder="Phone"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2"
        />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-1 font-semibold">Where should we come?</legend>
        <input
          name="serviceAddress"
          placeholder="Street address"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2"
        />
        <div className="flex gap-3">
          <input
            name="serviceCity"
            placeholder="City"
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
          <input
            name="serviceZip"
            placeholder="ZIP"
            required
            className="w-32 rounded-md border border-border bg-background px-3 py-2"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-1 font-semibold">When works best?</legend>
        <input
          name="scheduledAt"
          type="datetime-local"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2"
        />
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand px-4 py-2.5 font-semibold text-brand-foreground disabled:opacity-50"
      >
        {pending ? 'Booking…' : 'Confirm booking'}
      </button>
    </form>
  )
}
