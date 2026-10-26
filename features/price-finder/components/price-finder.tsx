'use client'

import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock, Search, ShieldCheck, X } from 'lucide-react'
import { siteButton } from '@/components/ui/site-button'
import { formatPrice } from '@/lib/format'
import { WARRANTY_YEARS } from '@/lib/contact'
import { VEHICLE_TYPES, vehicleClassLabel } from '@/lib/vehicles/classes'
import { cn } from '@/lib/utils'
import type { FinderVehicle, PriceFinderData } from '../types'
import { findByModelName, searchVehicles } from '../lib/match-vehicle'
import { buildQuoteHref } from '../lib/quote-href'

/**
 * "Find your price" -- the bar under the hero. Type a car, pick a service, see
 * the number. It is deliberately the loudest thing on the first screen: a solid
 * gold frame, a soft pulsing halo and a tag riding the top edge.
 */
export function PriceFinder({ data }: { data: PriceFinderData }) {
  const { vehicles, services, quickPicks } = data
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState('')
  const [vehicle, setVehicle] = useState<FinderVehicle | null>(null)
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [typeOpen, setTypeOpen] = useState(false)

  const suggestions = useMemo(
    () => (vehicle ? [] : searchVehicles(vehicles, query)),
    [vehicles, query, vehicle]
  )
  const chips = useMemo(
    () => quickPicks.map((m) => findByModelName(vehicles, m)).filter((v): v is FinderVehicle => !!v),
    [vehicles, quickPicks]
  )

  const service = services.find((s) => s.id === serviceId) ?? services[0] ?? null
  const price = vehicle && service ? (service.prices[vehicle.vehicleClass] ?? null) : null
  const fromPrice = service ? Math.min(...Object.values(service.prices)) : null

  function choose(v: FinderVehicle) {
    setVehicle(v)
    setQuery(v.label)
    setOpen(false)
  }

  // A car that isn't listed: pick the body type and get the same price.
  function chooseType(t: (typeof VEHICLE_TYPES)[number]) {
    setVehicle({ id: `type-${t.id}`, make: 'Other', model: t.name, label: `${t.name} (car type)`, vehicleClass: t.id })
    setQuery(`${t.name} (car type)`)
    setOpen(false)
    setTypeOpen(false)
  }

  function clear() {
    setVehicle(null)
    setQuery('')
    setActive(0)
    inputRef.current?.focus()
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(suggestions[active] ?? suggestions[0])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showList = open && suggestions.length > 0
  const noMatch = open && !vehicle && query.trim().length > 1 && suggestions.length === 0

  const LABEL = 'mb-2 block text-[0.76rem] font-semibold tracking-[0.08em] text-chrome-400 uppercase'
  const FIELD =
    'h-[58px] w-full rounded-[10px] border-[1.5px] border-line-2 bg-background px-[18px] text-[1.02rem] text-foreground outline-none placeholder:text-chrome-500/75 focus-visible:border-gold-500 focus-visible:ring-4 focus-visible:ring-gold-500/20'

  return (
    <section
      id="price-finder"
      aria-labelledby="price-finder-title"
      className="price-finder-glow relative max-w-[1120px] rounded-[22px] border-2 border-gold-500 bg-card px-5 pt-8 pb-6 text-left sm:px-[38px] sm:pt-[34px] sm:pb-7 dk:rounded-sm"
    >
      <span className="absolute -top-[15px] left-5 rounded-full bg-gold-500 px-4 py-1.5 text-[0.68rem] font-bold tracking-[0.16em] text-gold-foreground uppercase sm:left-[38px] dk:rounded-xs">
        Instant price · No sign-up
      </span>

      <div className="grid items-start gap-x-8 gap-y-4 [grid-template-areas:'t''fields''price''btn''m''link'] min-[900px]:grid-cols-[minmax(0,1fr)_250px] min-[900px]:[grid-template-areas:'t_price''fields_btn''m_link'] min-[1100px]:grid-cols-[minmax(0,1fr)_280px]">
        <div className="[grid-area:t]">
          <h2 id="price-finder-title" className="font-display text-[1.5rem] font-semibold tracking-[-0.02em] text-chrome-100">
            Find your price
          </h2>
          <p className="mt-1.5 max-w-[52ch] text-[0.9rem] text-chrome-400">
            Type your car&apos;s name — see your exact price instantly. No sign-up.
          </p>
        </div>

        <div className="grid items-start gap-4 [grid-area:fields] min-[700px]:grid-cols-[1.35fr_1fr]">
        {/* Car */}
        <div className="relative">
          <label htmlFor="pf-car" className={LABEL}>
            Your car
          </label>
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-[17px] z-[2] size-[18px] -translate-y-1/2 text-chrome-400" />
            <input
              ref={inputRef}
              id="pf-car"
              role="combobox"
              aria-expanded={showList}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={showList ? `${listId}-${active}` : undefined}
              autoComplete="off"
              value={query}
              placeholder="Your car, e.g. Corolla"
              onChange={(e) => {
                setQuery(e.target.value)
                setVehicle(null)
                setActive(0)
                setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 120)}
              onKeyDown={onKeyDown}
              className={cn(FIELD, 'pr-11 pl-12')}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear car"
                onClick={clear}
                className="absolute top-1/2 right-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-chrome-400 hover:bg-tint hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}

            {showList && (
              <ul
                id={listId}
                role="listbox"
                className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-line-2 bg-popover py-1 shadow-xl dk:rounded-sm"
              >
                {suggestions.map((v, i) => (
                  <li
                    key={v.id}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      choose(v)
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm',
                      i === active ? 'bg-tint text-foreground' : 'text-chrome-300'
                    )}
                  >
                    <span>{v.label}</span>
                    <span className="text-xs text-chrome-400">{vehicleClassLabel(v.vehicleClass)}</span>
                  </li>
                ))}
              </ul>
            )}
            {noMatch && (
              <div className="absolute inset-x-0 top-full z-30 mt-1.5 rounded-xl border border-line-2 bg-popover px-4 py-3 text-sm text-chrome-300 shadow-xl dk:rounded-sm">
                No match yet.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    setTypeOpen(true)
                  }}
                  className="font-semibold text-gold-ink underline-offset-4 hover:underline"
                >
                  Choose your car type instead
                </button>
              </div>
            )}
          </div>

          {chips.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="mr-0.5 w-[3.1rem] text-[0.7rem] leading-[1.5] tracking-[0.1em] text-chrome-400 uppercase">Quick pick:</span>
              {chips.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => choose(v)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-[0.78rem] font-medium transition-colors dk:rounded-full',
                    vehicle?.id === v.id
                      ? 'border-gold-500 bg-gold-500 text-gold-foreground'
                      : 'border-line-2 bg-tint text-foreground hover:border-gold-500 hover:text-gold-ink'
                  )}
                >
                  {v.model}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Service */}
        <div>
          <label htmlFor="pf-service" className={LABEL}>
            Service
          </label>
          <div className="relative">
          <select
            id="pf-service"
            value={service?.id ?? ''}
            onChange={(e) => setServiceId(e.target.value)}
            className={cn(FIELD, 'truncate')}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          </div>
        </div>
        </div>

        {/* Price */}
        <div aria-live="polite" className="w-full rounded-[14px] border border-line-2 bg-tint px-5 py-3.5 [grid-area:price] min-[900px]:self-start dk:rounded-sm">
          <p className="text-[0.76rem] font-semibold tracking-[0.1em] text-chrome-400 uppercase">Your price</p>
          {vehicle && price != null ? (
            <>
              <p className="mt-0.5 font-display text-[2.1rem] leading-[1.1] font-semibold tracking-[-0.03em] whitespace-nowrap text-gold-ink">
                {formatPrice(price)}
              </p>
              <p className="mt-0.5 text-[0.76rem] leading-snug text-chrome-400">
                {vehicle.label} · {vehicleClassLabel(vehicle.vehicleClass)}
              </p>
            </>
          ) : vehicle ? (
            <p className="mt-1 text-sm text-chrome-300">Price on request for this car — book and we&apos;ll confirm.</p>
          ) : (
            <>
              <p className="mt-0.5 font-display text-[2.1rem] leading-[1.1] font-semibold tracking-[-0.03em] whitespace-nowrap text-gold-ink">
                {fromPrice != null ? (
                  <>
                    <span className="mr-1 text-base font-medium tracking-normal text-chrome-400">from</span>
                    {formatPrice(fromPrice)}
                  </>
                ) : (
                  '—'
                )}
              </p>
              <p className="mt-0.5 text-[0.76rem] leading-snug text-chrome-400">Pick your car for your exact price</p>
            </>
          )}
        </div>

        <Link
          href={buildQuoteHref(vehicle, service?.id ?? null)}
          className={cn(siteButton({ size: 'lg' }), 'h-[58px] w-full shadow-[0_18px_36px_-14px_color-mix(in_oklab,var(--gold-500)_75%,transparent)] [grid-area:btn] min-[900px]:mt-[30px]')}
        >
          Book this
          <ArrowRight />
        </Link>

        <p className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.78rem] text-chrome-400 [grid-area:m]">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 text-gold-ink" /> 60–90 min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-gold-ink" /> {WARRANTY_YEARS}-year results warranty
          </span>
        </p>
        <div className="flex flex-col gap-2 [grid-area:link] min-[900px]:items-end">
          <button
            type="button"
            aria-expanded={typeOpen}
            onClick={() => setTypeOpen((o) => !o)}
            className="text-[0.88rem] font-semibold text-gold-ink underline-offset-4 hover:underline"
          >
            Can&apos;t find your car? Choose the type yourself
          </button>
          {typeOpen && (
            <div role="group" aria-label="Car type" className="flex flex-wrap gap-2 min-[900px]:justify-end">
              {VEHICLE_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  title={t.examples}
                  onClick={() => chooseType(t)}
                  className="rounded-full border border-line-2 bg-background px-3.5 py-1.5 text-[0.82rem] font-medium text-chrome-100 transition hover:border-gold-500 hover:text-gold-ink"
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
