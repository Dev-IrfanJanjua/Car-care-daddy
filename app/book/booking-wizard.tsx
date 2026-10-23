'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  MapPin,
  Plus,
  ShieldCheck,
  User,
} from 'lucide-react'
import { createBooking } from '@/lib/actions/bookings'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FileDrop } from '@/components/ui/file-drop'
import { Separator } from '@/components/ui/separator'
import { WizardShell } from '@/components/quote/wizard-shell'
import { DateTimePicker } from '@/components/quote/date-time-picker'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { SERVICE_CITY, WARRANTY_YEARS } from '@/lib/contact'
import { normalizePhone, isValidPhone } from '@/lib/phone'
import type { DayHours } from '@/lib/business-hours'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} size="lg" className="h-11">
      {pending ? (
        'Booking…'
      ) : (
        <>
          <CircleCheck className="size-4" data-icon="inline-start" />
          Confirm Booking
        </>
      )}
    </Button>
  )
}

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

export type Upsell = { id: string; name: string; description: string | null; price: number }
export type QuoteLine = { serviceId: string; name: string; price: number }

type Step = 2 | 3 | 4

const STEP_META: Record<Step, { title: string; description?: string }> = {
  2: { title: 'Fill information' },
  3: { title: 'Select Date & Time' },
  4: { title: 'Confirm Details' },
}

/**
 * Information, Date & Time and Confirmation, sharing one <form> and one
 * WizardShell -- three visual steps, but Next only advances local state; the
 * form only really submits from Confirmation's button. That's what lets the
 * sidebar show four distinct numbered steps while Information/Date &
 * Time/Confirmation never leave this page or touch a server round trip until
 * the customer actually confirms. createBooking's contract doesn't change:
 * every field it reads is still a plain named input, just conditionally
 * rendered depending on which step is showing.
 */
export function BookingWizard(props: {
  make: string
  model: string
  year: string
  vehicleClass: string
  services: string
  lineItems: QuoteLine[]
  total: number
  upsells: Upsell[]
  servicesBackHref: string
  phone: { display: string; telHref: string }
  hours: DayHours | null
}) {
  const [step, setStep] = useState<Step>(2)

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [serviceAddress, setServiceAddress] = useState('')
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null)
  const [added, setAdded] = useState<Set<string>>(() => new Set())

  const normalizedPhone = normalizePhone(customerPhone)
  const informationValid =
    customerName.trim().length > 0 &&
    EMAIL_RE.test(customerEmail) &&
    isValidPhone(normalizedPhone) &&
    serviceAddress.trim().length > 0

  const scheduleValid = scheduledAt !== null

  const submittedServices = [...props.services.split(',').filter(Boolean), ...added].join(',')
  const runningTotal =
    props.total + props.upsells.filter((u) => added.has(u.id)).reduce((sum, u) => sum + u.price, 0)

  function toggleUpsell(id: string) {
    setAdded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function goNext() {
    if (step === 2 && informationValid) setStep(3)
    else if (step === 3 && scheduleValid) setStep(4)
  }

  function goBack() {
    if (step === 3) setStep(2)
    else if (step === 4) setStep(3)
  }

  const meta = STEP_META[step]

  return (
    <form action={createBooking}>
      {/* Always present regardless of which step is visually showing, so the
          real submit on step 4 carries everything the customer entered on 2
          and 3. */}
      <input type="hidden" name="make" value={props.make} />
      <input type="hidden" name="model" value={props.model} />
      <input type="hidden" name="year" value={props.year} />
      <input type="hidden" name="class" value={props.vehicleClass} />
      <input type="hidden" name="services" value={submittedServices} />
      <input type="hidden" name="customerName" value={customerName} />
      <input type="hidden" name="customerEmail" value={customerEmail} />
      <input type="hidden" name="customerPhone" value={normalizedPhone} />
      <input type="hidden" name="serviceAddress" value={serviceAddress} />
      <input type="hidden" name="scheduledAt" value={scheduledAt ? scheduledAt.toISOString() : ''} />

      <WizardShell
        currentStep={step}
        title={meta.title}
        description={meta.description}
        phone={props.phone}
        footer={
          <>
            {step === 2 ? (
              <Button variant="ghost" size="sm" render={<Link href={props.servicesBackHref} />}>
                <ArrowLeft className="size-4" data-icon="inline-start" />
                Back
              </Button>
            ) : (
              <Button type="button" variant="ghost" size="sm" onClick={goBack}>
                <ArrowLeft className="size-4" data-icon="inline-start" />
                Back
              </Button>
            )}

            {step === 4 ? (
              <SubmitButton />
            ) : (
              <Button
                type="button"
                size="lg"
                className="h-11"
                disabled={step === 2 ? !informationValid : !scheduleValid}
                onClick={goNext}
              >
                Next Step
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
            )}
          </>
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 2 && (
              <div className="space-y-6">
                <fieldset className="space-y-3">
                  <legend className="mb-1 flex items-center gap-2 text-sm font-semibold">
                    <User className="size-4 text-gold" />
                    Your contact info
                  </legend>
                  <Field
                    id="customerNameField"
                    label="Full name"
                    placeholder="Ayesha Khan"
                    autoComplete="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                  <Field
                    id="customerEmailField"
                    type="email"
                    label="Email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                  />
                  <Field
                    id="customerPhoneField"
                    type="tel"
                    label="Phone"
                    placeholder="03001234567"
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={11}
                    pattern="0[0-9]{10}"
                    title="11 digits starting with 0, e.g. 03001234567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(normalizePhone(e.target.value))}
                    required
                  />
                </fieldset>

                <Separator />

                <fieldset className="space-y-3">
                  <legend className="mb-1 flex items-center gap-2 text-sm font-semibold">
                    <MapPin className="size-4 text-gold" />
                    Where should we come?
                  </legend>
                  <Field
                    id="serviceAddressField"
                    label="Street address"
                    placeholder="House 12, Street 4, DHA Phase 5"
                    autoComplete="street-address"
                    value={serviceAddress}
                    onChange={(e) => setServiceAddress(e.target.value)}
                    required
                  />
                  {/* Fixed, not asked -- one city is the whole service area.
                      Not a real form field: createBooking ignores any posted
                      city and always uses the SERVICE_CITY constant. */}
                  <Field
                    id="serviceCityField"
                    label="City"
                    value={SERVICE_CITY}
                    readOnly
                    tabIndex={-1}
                    className="[&_input]:cursor-not-allowed [&_input]:bg-muted [&_input]:text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    We currently serve {SERVICE_CITY} only.
                  </p>
                </fieldset>
              </div>
            )}

            {step === 3 && (
              <DateTimePicker hours={props.hours} value={scheduledAt} onChange={setScheduledAt} />
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="rounded-lg border border-border/60 bg-muted/50 px-4 py-3 text-sm">
                  <p>
                    <span className="font-semibold text-gold-ink">Date &amp; Time:</span>{' '}
                    {scheduledAt
                      ? new Intl.DateTimeFormat('en-US', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: 'numeric',
                          minute: '2-digit',
                        }).format(scheduledAt)
                      : '—'}
                  </p>
                  <p className="mt-1">
                    <span className="font-semibold text-gold-ink">Vehicle:</span> {props.year}{' '}
                    {props.make} {props.model}
                  </p>
                  <p className="mt-1">
                    <span className="font-semibold text-gold-ink">Address:</span> {serviceAddress},{' '}
                    {SERVICE_CITY}
                  </p>
                </div>

                <div>
                  <ul className="space-y-2.5">
                    {props.lineItems.map((item) => (
                      <li key={item.serviceId} className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="tabular-nums">{formatPrice(item.price)}</span>
                      </li>
                    ))}
                    {props.upsells
                      .filter((u) => added.has(u.id))
                      .map((u) => (
                        <li key={u.id} className="flex justify-between text-sm text-gold-ink">
                          <span>{u.name} (added)</span>
                          <span className="tabular-nums">+{formatPrice(u.price)}</span>
                        </li>
                      ))}
                  </ul>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between rounded-lg bg-brand/5 px-4 py-3">
                    <span className="text-lg font-semibold">Total price</span>
                    <span className="text-lg font-bold tabular-nums text-brand">
                      {formatPrice(runningTotal)}
                    </span>
                  </div>
                </div>

                {/* The upsell -- specifically here, in Confirmation, where the
                    total is already on screen and the customer is one tap
                    from booking anyway. Kept out of Information/Date & Time so
                    it never competes with those for attention. */}
                {props.upsells.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold">Add to your booking</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Save a second visit — we can do these while we&apos;re with you.
                    </p>
                    <ul className="mt-3 space-y-2">
                      {props.upsells.map((u) => {
                        const isAdded = added.has(u.id)
                        return (
                          <li key={u.id}>
                            <button
                              type="button"
                              onClick={() => toggleUpsell(u.id)}
                              aria-pressed={isAdded}
                              className={cn(
                                'flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition-colors',
                                isAdded
                                  ? 'border-brand bg-brand/5 ring-1 ring-brand/30'
                                  : 'border-border hover:bg-muted'
                              )}
                            >
                              <span
                                className={cn(
                                  'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
                                  isAdded
                                    ? 'border-brand bg-brand text-white'
                                    : 'border-muted-foreground/40'
                                )}
                              >
                                {isAdded ? (
                                  <Check className="size-3" />
                                ) : (
                                  <Plus className="size-3" />
                                )}
                              </span>
                              <span className="flex-1">
                                <span className="block text-sm font-medium">{u.name}</span>
                                {u.description && (
                                  <span className="mt-0.5 block text-xs text-muted-foreground">
                                    {u.description}
                                  </span>
                                )}
                              </span>
                              <span className="text-sm font-semibold tabular-nums">
                                +{formatPrice(u.price)}
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}

                <div>
                  <Label htmlFor="photos">Add photos of the damage (optional)</Label>
                  <FileDrop id="photos" name="photos" className="mt-1.5" />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Helps your technician prep before they arrive.
                  </p>
                </div>

                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5 shrink-0 text-gold-ink" />
                  {WARRANTY_YEARS}-year warranty · confirm instantly on WhatsApp
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </WizardShell>
    </form>
  )
}
