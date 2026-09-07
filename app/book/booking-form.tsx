'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { motion } from 'motion/react'
import { CircleCheck, ShieldCheck } from 'lucide-react'
import { createBooking } from '@/lib/actions/bookings'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/format'
import { SERVICE_CITY, WARRANTY_YEARS } from '@/lib/contact'
import { normalizePhone } from '@/lib/phone'

// useFormStatus resets itself when the action settles, including on error --
// the previous manual `pending` state was never cleared, so a failed booking
// left the button reading "Booking…" forever.
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} size="lg" className="h-12 w-full text-base">
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

// Each block slides in slightly after the one above it, so the booking step
// resolves top-to-bottom instead of appearing all at once.
const section = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] as const },
})

/** Numbered marker, echoing the step circles on the homepage. */
function StepLegend({ index, children }: { index: number; children: string }) {
  return (
    <legend className="mb-4 flex items-center gap-2.5">
      <span className="flex size-7 items-center justify-center rounded-full border border-gold-700/50 bg-linear-to-br from-ink-700 to-ink-950 text-[11px] font-bold text-gold">
        {index}
      </span>
      <span className="font-semibold">{children}</span>
    </legend>
  )
}

/**
 * A labelled input. The form used to be placeholder-only, so every label
 * vanished the moment you typed into the field.
 */
function Field({
  id,
  label,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { id: string; label: string }) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 text-muted-foreground">
        {label}
      </Label>
      <Input id={id} className="h-11" {...props} />
    </div>
  )
}

export function BookingForm(props: {
  quoteId?: string
  make: string
  model: string
  year: string
  vehicleClass: string
  services: string
  total: number
}) {
  const [localWhen, setLocalWhen] = useState('')
  const [phone, setPhone] = useState('')

  const parsed = localWhen ? new Date(localWhen) : null
  const scheduledAtUtc =
    parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : ''

  return (
    <form action={createBooking} className="space-y-6">
      <input type="hidden" name="quoteId" value={props.quoteId ?? ''} />
      <input type="hidden" name="make" value={props.make} />
      <input type="hidden" name="model" value={props.model} />
      <input type="hidden" name="year" value={props.year} />
      <input type="hidden" name="class" value={props.vehicleClass} />
      <input type="hidden" name="services" value={props.services} />
      <input type="hidden" name="scheduledAt" value={scheduledAtUtc} />

      {/* Last step before committing, so what's being booked and what it costs
          stay on screen rather than sitting in the header as a grey aside. */}
      <motion.div
        {...section(0)}
        className="flex items-end justify-between gap-4 rounded-lg border border-border/60 bg-muted/50 px-4 py-3"
      >
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Your vehicle
          </p>
          <p className="mt-1 font-semibold">
            {props.year} {props.make} {props.model}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Total
          </p>
          <p className="mt-1 text-xl font-bold text-gold-ink tabular-nums">
            {formatPrice(props.total)}
          </p>
        </div>
      </motion.div>

      <motion.fieldset {...section(1)} className="space-y-3">
        <StepLegend index={1}>Your contact info</StepLegend>
        <Field
          id="customerName"
          name="customerName"
          label="Full name"
          placeholder="Ayesha Khan"
          autoComplete="name"
          required
        />
        <Field
          id="customerEmail"
          name="customerEmail"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        {/* Controlled so input is normalised as it is typed rather than
            rejected on submit: "0300 123 4567" and "+92 300 1234567" both
            become 03001234567. The server re-runs the same normaliser. */}
        <Field
          id="customerPhone"
          name="customerPhone"
          type="tel"
          label="Phone"
          placeholder="03001234567"
          autoComplete="tel"
          inputMode="numeric"
          maxLength={11}
          pattern="0[0-9]{10}"
          title="11 digits starting with 0, e.g. 03001234567"
          value={phone}
          onChange={(e) => setPhone(normalizePhone(e.target.value))}
          required
        />
      </motion.fieldset>

      {/* The separating rule sits on a wrapper rather than the <fieldset>: a
          bordered fieldset has its border notched around the <legend>, which
          renders as a stray line shooting out of the heading. */}
      <motion.div {...section(2)} className="border-t border-border/60 pt-6">
        <fieldset className="space-y-3">
          <StepLegend index={2}>Where should we come?</StepLegend>
          <Field
            id="serviceAddress"
            name="serviceAddress"
            label="Street address"
            placeholder="House 12, Street 4, DHA Phase 5"
            autoComplete="street-address"
            required
          />
          {/* One city is the whole service area, so this is fixed rather than
              asked. readOnly, not disabled: a disabled input submits nothing,
              which would post an empty city. The server ignores this value
              regardless -- see createBooking. */}
          <Field
            id="serviceCity"
            name="serviceCity"
            label="City"
            value={SERVICE_CITY}
            readOnly
            tabIndex={-1}
            aria-describedby="serviceCity-note"
            autoComplete="address-level2"
            className="[&_input]:cursor-not-allowed [&_input]:bg-muted [&_input]:text-muted-foreground"
            required
          />
          <p id="serviceCity-note" className="text-xs text-muted-foreground">
            We currently serve {SERVICE_CITY} only.
          </p>
        </fieldset>
      </motion.div>

      <motion.div {...section(3)} className="border-t border-border/60 pt-6">
        <fieldset className="space-y-3">
          <StepLegend index={3}>When works best?</StepLegend>
          <Field
            id="scheduledAtLocal"
            type="datetime-local"
            label="Appointment date and time"
            value={localWhen}
            onChange={(e) => setLocalWhen(e.target.value)}
            min={localMinValue()}
            required
          />
          <p className="text-xs text-muted-foreground">Times are in your local timezone.</p>
        </fieldset>
      </motion.div>

      <motion.div {...section(4)} className="space-y-3 border-t border-border/60 pt-6">
        <SubmitButton />
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 shrink-0 text-gold-ink" />
          {WARRANTY_YEARS}-year warranty · instant email confirmation
        </p>
      </motion.div>
    </form>
  )
}
