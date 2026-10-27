'use client'

import { waLink, bookingHelpMessage } from '@/lib/whatsapp/messages'
import { useId, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Clock, Search, X } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { SiteButton } from '@/components/ui/site-button'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'
import { VEHICLE_CLASSES, VEHICLE_TYPES, vehicleClassLabel, type VehicleClass } from '@/lib/vehicles/classes'
import { applyDiscount } from '@/features/bundles'
import { findByModelName, searchVehicles } from '@/features/price-finder/lib/match-vehicle'
import type { FinderVehicle } from '@/features/price-finder/types'
import { WizardShell } from '../wizard/wizard-shell'
import { CarTypeArt } from './car-type-art'

export type StepService = {
  id: string
  name: string
  description: string | null
  category: string | null
  is_package: boolean
  coming_soon: boolean
  /** services sharing a non-null group are alternatives: one at a time */
  exclusive_group: string | null
  /** price per car type; a missing type = not offered for it */
  prices: Partial<Record<string, number>>
}

export type StepBundle = { id: string; name: string; percent: number; serviceIds: string[] }

const GROUP_LABEL: Record<string, string> = {
  'glass-treatment': 'Windshield & glass polishing',
  headlights: 'Headlights',
  detailing: 'Detailing',
}

function groupKey(s: StepService) {
  return s.exclusive_group ?? s.category ?? 'other'
}

function groupLabel(key: string) {
  return GROUP_LABEL[key] ?? key.charAt(0).toUpperCase() + key.slice(1)
}

const THIS_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: THIS_YEAR + 1 - 1989 }, (_, i) => String(THIS_YEAR + 1 - i))

/**
 * Step 1 of the booking flow, in one screen: the car (type cards, with an
 * optional name search that picks the type for you), the year, and the
 * service(s). It replaces the old "Get an instant quote" form plus its
 * separate services page -- nothing about a car is needed beyond its type,
 * because the price depends on the type alone.
 */
export function ServiceStep({
  vehicles,
  quickPicks,
  services,
  bundles,
  initial,
  phone,
}: {
  vehicles: FinderVehicle[]
  quickPicks: string[]
  services: StepService[]
  bundles: StepBundle[]
  initial: {
    make?: string
    model?: string
    year?: string
    vehicleClass?: string
    services?: string
    bundle?: string
  }
  phone: { display: string; telHref: string; whatsappUrl: string }
}) {
  const router = useRouter()
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const bookable = useMemo(() => services.filter((s) => !s.coming_soon), [services])

  const initialVehicle = useMemo(
    () => vehicles.find((v) => v.make === initial.make && v.model === initial.model) ?? null,
    [vehicles, initial.make, initial.model]
  )

  const [vehicle, setVehicle] = useState<FinderVehicle | null>(initialVehicle)
  const [query, setQuery] = useState(
    initialVehicle ? initialVehicle.label : initial.make === 'Other' && initial.model !== 'Not listed' ? (initial.model ?? '') : ''
  )
  const [cls, setCls] = useState<VehicleClass | null>(() => {
    const c = initial.vehicleClass ?? initialVehicle?.vehicleClass
    return (VEHICLE_CLASSES as string[]).includes(c ?? '') ? (c as VehicleClass) : null
  })
  const [year, setYear] = useState(initial.year && YEARS.includes(initial.year) ? initial.year : '')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const bundle = useMemo(() => {
    const b = bundles.find((x) => x.id === initial.bundle)
    return b && b.serviceIds.every((id) => bookable.some((s) => s.id === id)) ? b : undefined
  }, [bundles, initial.bundle, bookable])

  const [selected, setSelected] = useState<Set<string>>(() => {
    const fromUrl = (initial.services ?? '').split(',').filter((id) => bookable.some((s) => s.id === id))
    return new Set(fromUrl.length > 0 ? fromUrl : (bundle?.serviceIds ?? []))
  })

  const suggestions = useMemo(() => (vehicle ? [] : searchVehicles(vehicles, query)), [vehicles, query, vehicle])
  const chips = useMemo(
    () => quickPicks.map((m) => findByModelName(vehicles, m)).filter((v): v is FinderVehicle => !!v),
    [vehicles, quickPicks]
  )

  const priceOf = (s: StepService) => (cls ? (s.prices[cls] ?? null) : null)
  const fromOf = (s: StepService) => {
    const all = Object.values(s.prices).filter((n): n is number => typeof n === 'number' && n > 0)
    return all.length ? Math.min(...all) : null
  }

  // Services are shown for the chosen type; with none chosen yet, every
  // sellable service is listed with a "from" price so the page is never empty.
  const visible = useMemo(
    () => services.filter((s) => s.coming_soon || !cls || s.prices[cls] != null),
    [services, cls]
  )

  const groups = useMemo(() => {
    const map = new Map<string, StepService[]>()
    for (const s of visible) {
      const k = groupKey(s)
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(s)
    }
    return Array.from(map.entries())
  }, [visible])

  const bundleOn = Boolean(bundle && bundle.percent > 0 && bundle.serviceIds.every((id) => selected.has(id)))

  const { total, saving } = useMemo(() => {
    const picked = bookable.filter((s) => selected.has(s.id))
    // Before a car type is chosen, show the lowest price ("from ...").
    const price = (s: StepService) => {
      if (cls) return s.prices[cls] ?? 0
      const amounts = Object.values(s.prices).filter((n): n is number => typeof n === 'number' && n > 0)
      return amounts.length ? Math.min(...amounts) : 0
    }
    const list = picked.reduce((sum, s) => sum + price(s), 0)
    if (!bundleOn || !bundle) return { total: list, saving: 0 }
    const partsList = picked.filter((s) => bundle.serviceIds.includes(s.id)).reduce((sum, s) => sum + price(s), 0)
    const save = partsList - applyDiscount(partsList, bundle.percent)
    return { total: list - save, saving: save }
  }, [bookable, selected, bundleOn, bundle, cls])

  // "Need help finishing?" -- carries whatever has been chosen so far.
  const helpHref = waLink(
    phone.whatsappUrl,
    bookingHelpMessage(
      {
        car: vehicle?.label,
        year: year || undefined,
        carType: cls ? vehicleClassLabel(cls) : undefined,
        services: bookable.filter((s) => selected.has(s.id)).map((s) => s.name),
        total: cls ? total : undefined,
      },
      formatPrice
    )
  )

  function chooseVehicle(v: FinderVehicle) {
    setVehicle(v)
    setQuery(v.label)
    setOpen(false)
    if ((VEHICLE_CLASSES as string[]).includes(v.vehicleClass)) setCls(v.vehicleClass as VehicleClass)
  }

  function clearVehicle() {
    setVehicle(null)
    setQuery('')
    setActive(0)
    inputRef.current?.focus()
  }

  function chooseType(id: VehicleClass) {
    setCls(id)
    // A car picked from the list belongs to one type; choosing another type by
    // hand means that car no longer applies, so it falls back to a typed name.
    if (vehicle && vehicle.vehicleClass !== id) setVehicle(null)
  }

  function toggle(service: StepService, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (!checked) {
        next.delete(service.id)
        return next
      }
      next.add(service.id)
      if (service.exclusive_group) {
        for (const s of bookable) {
          if (s.id !== service.id && s.exclusive_group === service.exclusive_group) next.delete(s.id)
        }
      }
      return next
    })
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      chooseVehicle(suggestions[active] ?? suggestions[0])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const missing: string[] = []
  if (!cls) missing.push('car type')
  if (!year) missing.push('year')
  if (selected.size === 0) missing.push('a service')
  const canContinue = missing.length === 0

  // Next stays pressable: with something missing it highlights what is needed
  // (red border + message) and scrolls to the first gap.
  const [showErrors, setShowErrors] = useState(false)
  const carTypeErr = showErrors && !cls
  const yearErr = showErrors && !year
  const svcErr = showErrors && selected.size === 0

  function next() {
    if (!canContinue || !cls) {
      setShowErrors(true)
      const target = !cls ? 'car-type-h' : !year ? 'step-year' : 'svc-h'
      const el = document.getElementById(target)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const params = new URLSearchParams({
      make: vehicle ? vehicle.make : 'Other',
      model: vehicle ? vehicle.model : query.trim().slice(0, 60) || 'Not listed',
      year,
      class: cls,
      services: Array.from(selected).join(','),
    })
    if (bundleOn && bundle) params.set('bundle', bundle.id)
    router.push(`/book?${params.toString()}`)
  }

  const showList = open && suggestions.length > 0
  const noMatch = open && !vehicle && query.trim().length > 1 && suggestions.length === 0

  return (
    <WizardShell
      currentStep={1}
      title="Choose your car & service"
      description="Pick your car type and the work you need — you'll see your exact price straight away."
      phone={phone}
      helpHref={helpHref}
      footer={
        <>
          <SiteButton variant="quiet" size="sm" className="px-1 sm:px-5" render={<Link href="/" />}>
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Back
          </SiteButton>
          <span className="ml-auto text-right leading-tight whitespace-nowrap sm:order-2 sm:mr-4 sm:ml-auto">
            <span className="block text-xs text-muted-foreground">
              {selected.size} service{selected.size === 1 ? '' : 's'}
              {saving > 0 && <span className="font-medium text-[#1a8f50]"> · saving {formatPrice(saving)}</span>}
            </span>
            <span className="block text-lg font-bold tabular-nums">
              {total > 0 ? (
                <>
                  {!cls && <span className="mr-1 text-xs font-medium text-muted-foreground">from</span>}
                  {formatPrice(total)}
                </>
              ) : (
                '—'
              )}
            </span>
          </span>
          <SiteButton type="button" className="order-last h-11 w-full px-5 sm:order-3 sm:h-[52px] sm:w-auto sm:px-7" onClick={next}>
            Next Step
            <ArrowRight className="size-4" data-icon="inline-end" />
          </SiteButton>
        </>
      }
    >
      <div className="space-y-9">
        {/* 1 — car type */}
        <section aria-labelledby="car-type-h">
          <h2 id="car-type-h" className="font-display text-base font-semibold">
            1. Your car type
          </h2>
          {carTypeErr && (
            <p role="alert" className="mt-2 text-sm font-medium text-red-600">
              Please choose your car type — the price depends on it.
            </p>
          )}
          <div role="radiogroup" aria-label="Car type" className={cn('mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4', carTypeErr && 'rounded-2xl p-1.5 ring-2 ring-red-500/70')}>
            {VEHICLE_TYPES.map((t) => {
              const on = cls === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => chooseType(t.id)}
                  className={cn(
                    'group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-card text-left transition-all focus-visible:ring-4 focus-visible:ring-gold-500/30 focus-visible:outline-none',
                    on
                      ? 'border-gold-500 shadow-[0_10px_30px_-14px_color-mix(in_oklab,var(--gold-500)_70%,transparent)] ring-2 ring-gold-500/50'
                      : 'border-border hover:-translate-y-0.5 hover:border-gold-500/60 hover:shadow-md'
                  )}
                >
                  {on && (
                    <span className="absolute top-2 right-2 z-10 grid size-6 place-items-center rounded-full bg-gold-500 text-gold-foreground">
                      <Check aria-hidden className="size-3.5" strokeWidth={3} />
                    </span>
                  )}
                  <span className="block bg-tint px-2 pt-3 pb-1">
                    <CarTypeArt type={t.id} className="mx-auto h-auto w-full max-w-[200px] transition-transform duration-300 group-hover:scale-[1.04]" />
                  </span>
                  <span className={cn('block px-3 py-2.5 text-center text-sm font-bold tracking-wide uppercase', on ? 'bg-gold-500/15 text-gold-ink' : 'text-foreground')}>
                    {t.name}
                  </span>
                  <span className="block flex-1 px-3 pb-3 text-center text-xs leading-snug text-muted-foreground">{t.examples}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* 2 — optional name search + year */}
        <section aria-labelledby="car-find-h">
          <h2 id="car-find-h" className="font-display text-base font-semibold">
            2. Not sure of the type? Search your car
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_150px]">
            <div className="relative">
              <label htmlFor="step-car" className="sr-only">
                Your car
              </label>
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 z-[2] size-[18px] -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                id="step-car"
                role="combobox"
                aria-expanded={showList}
                aria-controls={listId}
                aria-autocomplete="list"
                autoComplete="off"
                value={query}
                maxLength={60}
                placeholder="Type your car, e.g. Corolla, Alto, Fortuner"
                onChange={(e) => {
                  setQuery(e.target.value)
                  setVehicle(null)
                  setActive(0)
                  setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 120)}
                onKeyDown={onKeyDown}
                className="h-12 w-full rounded-xl border border-input bg-background pr-10 pl-11 text-[0.95rem] outline-none placeholder:text-muted-foreground/70 focus-visible:border-gold-500 focus-visible:ring-4 focus-visible:ring-gold-500/20"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear car"
                  onClick={clearVehicle}
                  className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
              {showList && (
                <ul id={listId} role="listbox" className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-border bg-popover py-1 shadow-xl">
                  {suggestions.map((v, i) => (
                    <li
                      key={v.id}
                      role="option"
                      aria-selected={i === active}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        chooseVehicle(v)
                      }}
                      onMouseEnter={() => setActive(i)}
                      className={cn('flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm', i === active && 'bg-muted')}
                    >
                      <span>{v.label}</span>
                      <span className="text-xs text-muted-foreground">{vehicleClassLabel(v.vehicleClass)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {noMatch && (
                <div className="absolute inset-x-0 top-full z-30 mt-1.5 rounded-xl border border-border bg-popover px-4 py-3 text-sm text-muted-foreground shadow-xl">
                  Not in our list? No problem — just pick the closest car type above.
                </div>
              )}
            </div>

            <div>
              <label htmlFor="step-year" className="sr-only">
                Year
              </label>
              <select
                id="step-year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={cn(
                  'h-12 w-full cursor-pointer rounded-xl border border-input bg-background px-3.5 text-[0.95rem] outline-none focus-visible:border-gold-500 focus-visible:ring-4 focus-visible:ring-gold-500/20',
                  !year && 'text-muted-foreground',
                  yearErr && 'border-red-500 bg-red-500/5 ring-2 ring-red-500/20'
                )}
              >
                <option value="">Year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              {yearErr && (
                <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                  Please select your car&apos;s year.
                </p>
              )}
            </div>
          </div>

          {vehicle && cls && (
            <p className="mt-2.5 flex items-center gap-1.5 text-sm text-[#1a8f50]" role="status">
              <Check className="size-4" />
              {vehicle.label} is a <b>{vehicleClassLabel(cls)}</b> — price set.
            </p>
          )}

          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[0.7rem] tracking-[0.1em] text-muted-foreground uppercase">Popular:</span>
              {chips.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => chooseVehicle(v)}
                  className={cn(
                    'cursor-pointer rounded-full border px-3 py-1.5 text-[0.8rem] font-medium transition-colors',
                    vehicle?.id === v.id
                      ? 'border-gold-500 bg-gold-500 text-gold-foreground'
                      : 'border-border bg-tint hover:border-gold-500 hover:text-gold-ink'
                  )}
                >
                  {v.model}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 3 — services */}
        <section aria-labelledby="svc-h">
          <h2 id="svc-h" className="font-display text-base font-semibold">
            3. Choose your service
          </h2>
          {svcErr && (
            <p role="alert" className="mt-2 text-sm font-medium text-red-600">
              Please select at least one service.
            </p>
          )}

          {bundle && (
            <p
              role="status"
              className={cn(
                'mt-3 flex gap-2.5 rounded-lg border px-4 py-3 text-sm',
                bundleOn ? 'border-gold-500/50 bg-gold-500/10' : 'border-border text-muted-foreground'
              )}
            >
              <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-ink" />
              <span>
                {bundleOn ? (
                  <>
                    <b>{bundle.name} bundle</b> — {bundle.percent}% off is applied to these services. Changing them removes the bundle price.
                  </>
                ) : (
                  <>The {bundle.name} bundle price needs all of its services ticked.</>
                )}
              </span>
            </p>
          )}

          {!cls && <p className="mt-2 text-sm text-muted-foreground">Prices shown are “from” prices — pick your car type to see yours.</p>}

          <div className="mt-4 space-y-6">
            {groups.map(([key, items]) => {
              const exclusiveCount = items.filter((s) => s.exclusive_group && !s.coming_soon).length
              return (
                <div key={key} className="space-y-2.5">
                  <h3 className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {groupLabel(key)}
                    {exclusiveCount > 1 && (
                      <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-[0.65rem] tracking-normal text-gold-ink normal-case">choose one</span>
                    )}
                  </h3>
                  <ul className="space-y-2">
                    {items.map((s) => {
                      const checked = selected.has(s.id)

                      if (s.coming_soon) {
                        return (
                          <li key={s.id}>
                            <div aria-disabled className="flex items-start gap-3 rounded-lg border border-dashed border-border p-4 opacity-70">
                              <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                              <span className="flex-1">
                                <span className="block font-medium">{s.name}</span>
                                {s.description && <span className="mt-0.5 block text-sm text-muted-foreground">{s.description}</span>}
                              </span>
                              <Badge variant="secondary" className="shrink-0">
                                Coming soon
                              </Badge>
                            </div>
                          </li>
                        )
                      }

                      const price = priceOf(s)
                      const from = fromOf(s)
                      const rowClass = cn(
                        'flex w-full cursor-pointer items-start gap-3 rounded-lg border p-4 text-left font-normal transition-colors',
                        checked ? 'border-brand bg-brand/5 ring-1 ring-brand/30' : 'border-border hover:bg-muted'
                      )
                      const body = (
                        <>
                          <span className="flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="font-medium">{s.name}</span>
                              {s.is_package && (
                                <Badge variant="secondary" className="shrink-0">
                                  Complete package
                                </Badge>
                              )}
                            </span>
                            {s.description && <span className="mt-0.5 block text-sm text-muted-foreground">{s.description}</span>}
                          </span>
                          <span className="text-right font-semibold tabular-nums">
                            {price != null ? (
                              formatPrice(price)
                            ) : from != null ? (
                              <span className="text-sm font-medium text-muted-foreground">from {formatPrice(from)}</span>
                            ) : null}
                          </span>
                        </>
                      )

                      // Alternatives draw as radios, everything else as checkboxes:
                      // one glass treatment, plus any add-ons. A button with
                      // role="radio" rather than a native radio so a choice can
                      // be un-picked again.
                      if (s.exclusive_group) {
                        return (
                          <li key={s.id}>
                            <button type="button" role="radio" aria-checked={checked} onClick={() => toggle(s, !checked)} className={rowClass}>
                              <span
                                aria-hidden
                                className={cn(
                                  'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                                  checked ? 'border-brand' : 'border-input'
                                )}
                              >
                                {checked && <span className="size-2 rounded-full bg-brand" />}
                              </span>
                              {body}
                            </button>
                          </li>
                        )
                      }

                      return (
                        <li key={s.id}>
                          <label htmlFor={`service-${s.id}`} className={rowClass}>
                            {/* `name` keeps Base UI's hidden input absolutely
                                positioned; without it the page jumped to the top
                                on every tick. */}
                            <Checkbox
                              id={`service-${s.id}`}
                              name={`service-${s.id}`}
                              checked={checked}
                              onCheckedChange={(c) => toggle(s, c === true)}
                              className="mt-0.5"
                            />
                            {body}
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>

          {!canContinue && (
            <p
              role={svcErr ? 'alert' : undefined}
              className={cn('mt-5 text-sm', svcErr ? 'rounded-lg border border-red-500 bg-red-500/5 px-4 py-3 font-medium text-red-600' : 'text-muted-foreground')}
            >
              To continue, choose {missing.join(', ').replace(/, ([^,]*)$/, ' and $1')}.
            </p>
          )}
        </section>
      </div>
    </WizardShell>
  )
}
