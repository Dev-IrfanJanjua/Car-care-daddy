'use client'

import { useState } from 'react'
import { createBooking } from '@/lib/actions/bookings'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
    <form action={createBooking} className="space-y-6" onSubmit={() => setPending(true)}>
      <input type="hidden" name="quoteId" value={props.quoteId ?? ''} />
      <input type="hidden" name="make" value={props.make} />
      <input type="hidden" name="model" value={props.model} />
      <input type="hidden" name="year" value={props.year} />
      <input type="hidden" name="class" value={props.vehicleClass} />
      <input type="hidden" name="services" value={props.services} />

      <fieldset className="space-y-3">
        <legend className="mb-1 font-semibold">Your contact info</legend>
        <Input name="customerName" placeholder="Full name" required />
        <Input name="customerEmail" type="email" placeholder="Email" required />
        <Input name="customerPhone" type="tel" placeholder="Phone" required />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-1 font-semibold">Where should we come?</legend>
        <Input name="serviceAddress" placeholder="Street address" required />
        <div className="flex gap-3">
          <Input name="serviceCity" placeholder="City" required />
          <Input name="serviceZip" placeholder="ZIP" required className="w-32" />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-1 font-semibold">When works best?</legend>
        <Input name="scheduledAt" type="datetime-local" required />
      </fieldset>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Booking…' : 'Confirm booking'}
      </Button>
    </form>
  )
}
