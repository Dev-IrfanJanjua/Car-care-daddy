'use client'

import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock, Search, ShieldCheck, X } from 'lucide-react'
import { siteButton } from '@/components/ui/site-button'
import { formatPrice } from '@/lib/format'
import { WARRANTY_YEARS } from '@/lib/contact'
import { vehicleClassLabel } from '@/lib/vehicles/classes'
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

      <div className="grid items-start gap-x-[22px] gap-y-3 [grid-template-areas:'t''car''svc''price''btn''m''link'] min-[700px]:grid-cols-2 min-[700px]:[grid-template-areas:'t_t''car_svc''price_btn''m_link'] min-[1100px]:grid-cols-[1fr_1.4fr_.85fr_200px_190px] min-[1100px]:[grid-template-areas:'t_car_svc_price_btn''m_m_m_link_link']">
        <div className="[grid-area:t]">
          <h2 id="price-finder-title" className="font-display text-[1.35rem] font-semibold tracking-[-0.02em] text-chrome-100 min-[1100px]:whitespace-nowrap">
            Find your price
          </h2>
          <p className="mt-2 max-w-[24ch] text-[0.82rem] text-chrome-400 max-[1099px]:max-w-none">
            Type your car&apos;s name — see your exact price instantly. No sign-up.
          </p>
        </div>

        {/* Car */}
        <div className="relative [grid-area:car]">
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
                <Link href="/quote/not-listed" className="font-semibold text-gold-ink underline-offset-4 hover:underline">
                  Request a quote by hand
                </Link>
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
        <div className="[grid-area:svc]">
          <label htmlFor="pf-service" className={LABEL}>
            Service
          </label>
          <select
            id="pf-service"
            value={service?.id ?? ''}
            onChange={(e) => setServiceId(e.target.value)}
            className={cn(FIELD, 'text-ellipsis')}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div aria-live="polite" className="self-center [grid-area:price]">
          <p className="text-[0.76rem] font-semibold tracking-[0.1em] text-chrome-400 uppercase">Your price</p>
          {vehicle && price != null ? (
            <>
              <p className="mt-0.5 font-display text-[2.1rem] leading-[1.1] font-semibold tracking-[-0.03em] whitespace-nowrap text-gold-ink">
                {formatPrice(price)}
              </p>
              <p className="mt-0.5 max-w-[24ch] text-[0.74rem] leading-snug text-chrome-400">
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
              <p className="mt-0.5 max-w-[24ch] text-[0.74rem] leading-snug text-chrome-400">Pick your car for your exact price</p>
            </>
          )}
        </div>

        <Link
          href={buildQuoteHref(vehicle, service?.id ?? null)}
          className={cn(siteButton({ size: 'lg' }), 'h-[60px] w-full self-center shadow-[0_18px_36px_-14px_color-mix(in_oklab,var(--gold-500)_75%,transparent)] [grid-area:btn]')}
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
        <Link
          href="/quote/not-listed"
          className="text-[0.88rem] font-semibold text-gold-ink underline-offset-4 [grid-area:link] hover:underline min-[700px]:justify-self-end"
        >
          Can&apos;t find your car? Choose the type yourself
        </Link>
      </div>
    </section>
  )
}
