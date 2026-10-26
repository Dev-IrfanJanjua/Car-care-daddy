'use client'

import { waLink, bookingHelpMessage } from '@/lib/whatsapp/messages'
import { formatPrice, formatAppointment } from '@/lib/format'
import { vehicleClassLabel, type VehicleClass } from '@/lib/vehicles/classes'
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
  Package,
  Plus,
  ShieldCheck,
  Undo2,
  User,
} from 'lucide-react'
import { createBooking } from '../../actions/create-booking'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SiteButton } from '@/components/ui/site-button'
import { FileDrop } from '@/components/ui/file-drop'
import { Separator } from '@/components/ui/separator'
import { WizardShell } from './wizard-shell'
import { DateTimePicker } from './date-time-picker'
import { cn } from '@/lib/utils'
import { SERVICE_CITY, WARRANTY_YEARS } from '@/lib/contact'
import { normalizePhone, isValidPhone } from '@/lib/phone'
import type { DayHours } from '@/lib/business-hours'
import { applyDiscount } from '@/features/bundles'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <SiteButton type="submit" disabled={pending} >
      {pending ? (
        'Booking…'
      ) : (
        <>
          <CircleCheck className="size-4" data-icon="inline-start" />
          Confirm Booking
        </>
      )}
    </SiteButton>
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
      <Input id={id}  {...props} />
    </div>
  )
}

export type Upsell = { id: string; name: string; description: string | null; price: number; exclusiveGroup: string | null }
export type BundleOption = { id: string; name: string; badge: string | null; percent: number; serviceIds: string[] }
export type QuoteLine = { serviceId: string; name: string; price: number; originalPrice?: number }

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
  /** bundle id when its discount applies, else '' */
  bundle: string
  discount: number
  lineItems: QuoteLine[]
  total: number
  upsells: Upsell[]
  bundleOptions: BundleOption[]
  servicesBackHref: string
  phone: { display: string; telHref: string; whatsappUrl: string }
  hours: DayHours | null
  /** start times of existing bookings (UTC ISO) */
  bookedTimes: string[]
}) {
  const [step, setStep] = useState<Step>(2)

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [serviceAddress, setServiceAddress] = useState('')
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null)

  const normalizedPhone = normalizePhone(customerPhone)
  const informationValid =
    customerName.trim().length > 0 &&
    EMAIL_RE.test(customerEmail) &&
    isValidPhone(normalizedPhone) &&
    serviceAddress.trim().length > 0

  const scheduleValid = scheduledAt !== null

  // The booking's services. Starts as what the customer chose on step 1 and can
  // be changed here: add a service, swap one glass option for another, or switch
  // to a bundle. `bundleId` is the bundle whose price is applied (it starts as
  // whatever the customer arrived with); `snapshot` remembers the booking as it
  // was before a bundle was applied, so "Revert" puts it back exactly.
  const initialIds = props.services.split(',').filter(Boolean)
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds)
  const [bundleId, setBundleId] = useState(props.bundle)
  const [snapshot, setSnapshot] = useState<{ ids: string[]; bundleId: string } | null>(null)

  const selectedSet = new Set(selectedIds)
  const initialSet = new Set(initialIds)

  const svc = new Map(props.upsells.map((u) => [u.id, u]))
  // Selected services that were already priced by the server (e.g. arrived with
  // a bundle) still resolve: upsells holds every sellable service.
  const priceOf = (id: string) => svc.get(id)?.price ?? 0

  // Applying `ids` to the booking: a service in an exclusive group replaces the
  // others in its group (one glass treatment at a time).
  function withExclusivity(base: string[], incoming: string[]) {
    const groups = new Set(incoming.map((id) => svc.get(id)?.exclusiveGroup).filter(Boolean))
    const kept = base.filter((id) => !incoming.includes(id) && !groups.has(svc.get(id)?.exclusiveGroup ?? ''))
    return [...kept, ...incoming]
  }

  const bundleSaving = (b: BundleOption, ids: Set<string>) => {
    const parts = b.serviceIds.reduce((sum, id) => sum + (ids.has(id) ? priceOf(id) : 0), 0)
    return parts - applyDiscount(parts, b.percent)
  }

  // A bundle only counts while every one of its services is still in the booking.
  const activeBundle = props.bundleOptions.find((b) => b.id === bundleId && b.serviceIds.every((id) => selectedSet.has(id))) ?? null
  const discount = activeBundle ? bundleSaving(activeBundle, selectedSet) : 0
  const fullTotal = selectedIds.reduce((sum, id) => sum + priceOf(id), 0)
  const runningTotal = fullTotal - discount

  const submittedServices = selectedIds.join(',')

  // "Need help finishing?" -- everything entered so far, ready to send.
  const helpHref = waLink(
    props.phone.whatsappUrl,
    bookingHelpMessage(
      {
        car: [props.make, props.model].filter(Boolean).join(' '),
        year: props.year || undefined,
        carType: vehicleClassLabel(props.vehicleClass as VehicleClass),
        services: selectedIds.map((id) => svc.get(id)?.name).filter((n): n is string => !!n),
        total: runningTotal,
        when: scheduledAt ? formatAppointment(scheduledAt.toISOString()) : undefined,
        name: customerName.trim() || undefined,
      },
      formatPrice
    )
  )

  // Bundles on offer: any bundle not applied yet. Services in the booking that
  // clash with the bundle's (another glass option) are swapped out for it, and
  // the card says exactly what is replaced and what is added.
  const offers = props.bundleOptions
    .filter((b) => b.id !== activeBundle?.id)
    .map((b) => {
      const next = withExclusivity(selectedIds, b.serviceIds)
      const nextSet = new Set(next)
      const removed = selectedIds.filter((id) => !nextSet.has(id))
      const added = b.serviceIds.filter((id) => !selectedSet.has(id))
      const saving = bundleSaving(b, nextSet)
      const newTotal = next.reduce((sum, id) => sum + priceOf(id), 0) - saving
      return { bundle: b, next, removed, added, saving, newTotal }
    })
    // relevant when it shares a service with the booking or replaces one of it
    .filter((o) => o.removed.length > 0 || o.bundle.serviceIds.some((id) => selectedSet.has(id)))

  function applyBundle(o: (typeof offers)[number]) {
    setSnapshot({ ids: selectedIds, bundleId })
    setSelectedIds(o.next)
    setBundleId(o.bundle.id)
  }

  function revertBundle() {
    if (snapshot) {
      setSelectedIds(snapshot.ids)
      setBundleId(snapshot.bundleId)
      setSnapshot(null)
    } else {
      setBundleId('') // arrived with a bundle: take the price off, keep the services
    }
  }

  // Add or swap in one service from the list below. Services the customer
  // chose in step 1 are locked in this list (they are changed by going back);
  // anything added here can be taken off again, which also brings back whatever
  // it replaced.
  const [replaced, setReplaced] = useState<Record<string, string[]>>({})

  function toggleService(id: string) {
    if (initialSet.has(id) && selectedSet.has(id)) return
    setSnapshot(null)
    if (selectedSet.has(id)) {
      const back = replaced[id] ?? []
      setSelectedIds((prev) => [...prev.filter((x) => x !== id), ...back.filter((x) => !prev.includes(x))])
      setReplaced((r) => {
        const { [id]: _drop, ...rest } = r
        void _drop
        return rest
      })
      return
    }
    const next = withExclusivity(selectedIds, [id])
    setReplaced((r) => ({ ...r, [id]: selectedIds.filter((x) => !next.includes(x)) }))
    setSelectedIds(next)
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
      {/* honeypot: hidden from people and screen readers, bots fill it in */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input type="hidden" name="make" value={props.make} />
      <input type="hidden" name="model" value={props.model} />
      <input type="hidden" name="year" value={props.year} />
      <input type="hidden" name="class" value={props.vehicleClass} />
      <input type="hidden" name="services" value={submittedServices} />
      <input type="hidden" name="bundle" value={activeBundle?.id ?? ''} />
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
        helpHref={helpHref}
        footer={
          <>
            {step === 2 ? (
              <SiteButton variant="quiet" size="sm" render={<Link href={props.servicesBackHref} />}>
                <ArrowLeft className="size-4" data-icon="inline-start" />
                Back
              </SiteButton>
            ) : (
              <SiteButton type="button" variant="quiet" size="sm" onClick={goBack}>
                <ArrowLeft className="size-4" data-icon="inline-start" />
                Back
              </SiteButton>
            )}

            {step === 4 ? (
              <SubmitButton />
            ) : (
              <SiteButton
                type="button"
               
                
                disabled={step === 2 ? !informationValid : !scheduleValid}
                onClick={goNext}
              >
                Next Step
                <ArrowRight className="size-4" data-icon="inline-end" />
              </SiteButton>
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
              <DateTimePicker hours={props.hours} booked={props.bookedTimes} value={scheduledAt} onChange={setScheduledAt} />
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
                    {props.make === 'Other' ? '' : `${props.make} `}{props.model}
                  </p>
                  <p className="mt-1">
                    <span className="font-semibold text-gold-ink">Address:</span> {serviceAddress},{' '}
                    {SERVICE_CITY}
                  </p>
                </div>

                <div>
                  <ul className="space-y-2.5">
                    {selectedIds.map((id) => {
                      const item = svc.get(id)
                      if (!item) return null
                      const isAddedItem = !initialSet.has(id)
                      return (
                        <li key={id} className={cn('flex justify-between gap-3 text-sm', isAddedItem && 'text-gold-ink')}>
                          <span>
                            {item.name}
                            {isAddedItem && ' (added)'}
                          </span>
                          <span className="tabular-nums">{isAddedItem ? '+' : ''}{formatPrice(item.price)}</span>
                        </li>
                      )
                    })}
                  </ul>

                  <Separator className="my-4" />

                  {discount > 0 && activeBundle && (
                    <p className="mb-3 flex justify-between text-sm font-medium text-[#1a8f50]">
                      <span>{activeBundle.name} bundle · {activeBundle.percent}% off</span>
                      <span className="tabular-nums">−{formatPrice(discount)}</span>
                    </p>
                  )}

                  <div className="flex items-center justify-between rounded-lg bg-brand/5 px-4 py-3">
                    <span className="text-lg font-semibold">Total price</span>
                    <span className="text-lg font-bold tabular-nums text-gold-ink">
                      {formatPrice(runningTotal)}
                    </span>
                  </div>
                </div>

                {/* Bundle: switch to one for a discount, or revert. Applied state is
                    shown first and on its own so it can't be missed. */}
                {activeBundle && (
                  <div role="status" className="rounded-xl border-2 border-[#1a8f50]/50 bg-[#1a8f50]/8 p-4">
                    <div className="flex items-start gap-3">
                      <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-[#1a8f50] text-white">
                        <Check className="size-5" strokeWidth={3} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{activeBundle.name} bundle applied</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          You&apos;re saving <b className="text-[#1a8f50]">{formatPrice(discount)}</b> ({activeBundle.percent}% off these services).
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#1a8f50]/25 pt-3">
                      <p className="text-xs text-muted-foreground">
                        {snapshot
                          ? 'Reverting puts your booking back exactly as it was before the bundle.'
                          : 'Reverting takes the bundle price off and keeps your services.'}
                      </p>
                      <SiteButton type="button" variant="ghost" size="sm" className="cursor-pointer" onClick={revertBundle}>
                        <Undo2 className="size-4" data-icon="inline-start" />
                        Revert bundle
                      </SiteButton>
                    </div>
                  </div>
                )}

                {offers.length > 0 && (
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <Package className="size-4 text-gold-ink" />
                      Turn it into a bundle &amp; save
                    </p>
                    <ul className="mt-3 space-y-3">
                      {offers.map((o) => (
                        <li key={o.bundle.id} className="relative overflow-hidden rounded-xl border-2 border-gold-500/60 bg-gold-500/6 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-display text-base font-semibold">{o.bundle.name}</span>
                            <span className="rounded-full bg-gold-500 px-2.5 py-0.5 text-xs font-bold text-gold-foreground">
                              Save {o.bundle.percent}%
                            </span>
                          </div>
                          <ul className="mt-2.5 space-y-1.5 text-sm">
                            {o.bundle.serviceIds.map((id) => {
                              const have = selectedSet.has(id)
                              return (
                                <li key={id} className="flex items-center justify-between gap-3">
                                  <span className="flex items-center gap-2">
                                    <Check aria-hidden className={cn('size-4', have ? 'text-[#1a8f50]' : 'text-gold-ink')} />
                                    {svc.get(id)?.name}
                                  </span>
                                  <span className={cn('text-xs font-medium', have ? 'text-muted-foreground' : 'text-gold-ink')}>
                                    {have ? 'in your booking' : `+${formatPrice(priceOf(id))}`}
                                  </span>
                                </li>
                              )
                            })}
                            {o.removed.map((id) => (
                              <li key={id} className="flex items-center justify-between gap-3 text-muted-foreground">
                                <span className="flex items-center gap-2">
                                  <Undo2 aria-hidden className="size-4" />
                                  <s>{svc.get(id)?.name}</s>
                                </span>
                                <span className="text-xs font-medium">replaced · −{formatPrice(priceOf(id))}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-gold-500/30 pt-3.5">
                            <p className="text-sm">
                              <span className="text-muted-foreground">New total </span>
                              <b className="text-lg tabular-nums text-gold-ink">{formatPrice(o.newTotal)}</b>
                              <span className="ml-2 text-xs font-medium text-[#1a8f50]">bundle saves {formatPrice(o.saving)}</span>
                            </p>
                            <SiteButton type="button" size="sm" className="cursor-pointer" onClick={() => applyBundle(o)}>
                              Switch to this bundle
                            </SiteButton>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* The upsell -- specifically here, in Confirmation, where the
                    total is already on screen and the customer is one tap
                    from booking anyway. Kept out of Information/Date & Time so
                    it never competes with those for attention. */}
                {props.upsells.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold">Add to your booking</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Save a second visit — add a service, or upgrade your glass option.
                    </p>
                    <ul className="mt-3 space-y-2">
                      {props.upsells.filter((u) => {
                        // Only things that add to the booking: services already in
                        // it, plain add-ons, and swaps to a pricier option. A swap
                        // that would cost less is not offered.
                        if (selectedSet.has(u.id)) return true
                        const group = u.exclusiveGroup
                        const clash = group ? selectedIds.filter((id) => svc.get(id)?.exclusiveGroup === group) : []
                        return u.price - clash.reduce((sum, id) => sum + priceOf(id), 0) > 0
                      }).map((u) => {
                        const isOn = selectedSet.has(u.id)
                        const group = u.exclusiveGroup
                        const clashing = !isOn && group ? selectedIds.filter((id) => svc.get(id)?.exclusiveGroup === group) : []
                        const swapNames = clashing.map((id) => svc.get(id)?.name).filter(Boolean)
                        const delta = u.price - clashing.reduce((sum, id) => sum + priceOf(id), 0)
                        const locked = isOn && initialSet.has(u.id)
                        return (
                          <li key={u.id}>
                            <button
                              type="button"
                              onClick={() => toggleService(u.id)}
                              aria-pressed={isOn}
                              disabled={locked}
                              title={locked ? 'Part of your booking' : undefined}
                              className={cn(
                                'flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition-colors disabled:cursor-default',
                                isOn ? 'border-brand bg-brand/5 ring-1 ring-brand/30' : 'border-border hover:bg-muted'
                              )}
                            >
                              <span
                                className={cn(
                                  'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
                                  isOn ? 'border-brand bg-brand text-white' : 'border-muted-foreground/40'
                                )}
                              >
                                {isOn ? <Check className="size-3" /> : <Plus className="size-3" />}
                              </span>
                              <span className="flex-1">
                                <span className="block text-sm font-medium">{u.name}</span>
                                {u.description && <span className="mt-0.5 block text-xs text-muted-foreground">{u.description}</span>}
                                {swapNames.length > 0 && (
                                  <span className="mt-1 block text-xs font-medium text-gold-ink">Replaces {swapNames.join(' / ')}</span>
                                )}
                              </span>
                              <span className="text-right text-sm font-semibold tabular-nums">
                                {isOn ? (locked ? 'In booking' : 'Added · remove') : swapNames.length > 0 ? `${delta >= 0 ? '+' : '−'}${formatPrice(Math.abs(delta))}` : `+${formatPrice(u.price)}`}
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
