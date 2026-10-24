'use client'

import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { ArrowRight, Search, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

  return (
    <section
      id="price-finder"
      aria-labelledby="price-finder-title"
      className="price-finder-glow relative rounded-2xl border-2 border-gold-500 bg-card p-5 sm:p-8 dk:rounded-md"
    >
      <span className="absolute -top-3.5 left-6 rounded-full bg-gold-500 px-4 py-1.5 text-[0.68rem] font-bold tracking-[0.16em] text-gold-foreground uppercase sm:left-8 dk:rounded-xs">
        Instant price · No sign-up
      </span>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.45fr)_minmax(0,.9fr)_minmax(0,.95fr)] lg:items-start lg:gap-6">
        <div className="pt-1">
          <h2 id="price-finder-title" className="font-display text-2xl font-semibold text-chrome-100">
            Find your price
          </h2>
          <p className="mt-2 text-sm text-chrome-500">
            Type your car&apos;s name and see your exact price instantly.
          </p>
        </div>

        {/* Car */}
        <div>
          <label htmlFor="pf-car" className="mb-2 block text-xs font-semibold tracking-[0.14em] text-chrome-500 uppercase">
            Your car
          </label>
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-[1.1rem] -translate-y-1/2 text-chrome-500" />
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
              className="h-14 w-full rounded-xl border-[1.5px] border-input bg-background pr-11 pl-12 text-base text-foreground outline-none placeholder:text-chrome-500/80 focus-visible:border-gold-500 focus-visible:ring-4 focus-visible:ring-gold-500/20 dk:rounded-md"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear car"
                onClick={clear}
                className="absolute top-1/2 right-3 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-chrome-500 hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}

            {showList && (
              <ul
                id={listId}
                role="listbox"
                className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-popover py-1 shadow-xl dk:rounded-md"
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
                      i === active ? 'bg-muted text-foreground' : 'text-chrome-300'
                    )}
                  >
                    <span>{v.label}</span>
                    <span className="text-xs text-chrome-500">{vehicleClassLabel(v.vehicleClass)}</span>
                  </li>
                ))}
              </ul>
            )}
            {noMatch && (
              <div className="absolute inset-x-0 top-full z-30 mt-2 rounded-xl border border-border bg-popover px-4 py-3 text-sm text-chrome-300 shadow-xl dk:rounded-md">
                No match yet.{' '}
                <Link href="/quote/not-listed" className="font-semibold text-gold-ink underline-offset-4 hover:underline">
                  Request a quote by hand
                </Link>
              </div>
            )}
          </div>

          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[0.68rem] font-semibold tracking-[0.14em] text-chrome-500 uppercase">Quick pick</span>
              {chips.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => choose(v)}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-sm transition-colors dk:rounded-xs',
                    vehicle?.id === v.id
                      ? 'border-gold-500 bg-gold-500 text-gold-foreground'
                      : 'border-border bg-background text-foreground hover:border-gold-500'
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
          <label htmlFor="pf-service" className="mb-2 block text-xs font-semibold tracking-[0.14em] text-chrome-500 uppercase">
            Service
          </label>
          <select
            id="pf-service"
            value={service?.id ?? ''}
            onChange={(e) => setServiceId(e.target.value)}
            className="h-14 w-full rounded-xl border-[1.5px] border-input bg-background px-4 text-base text-foreground outline-none focus-visible:border-gold-500 focus-visible:ring-4 focus-visible:ring-gold-500/20 dk:rounded-md"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price + CTA */}
        <div className="flex flex-col gap-3">
          <div aria-live="polite">
            <p className="text-xs font-semibold tracking-[0.14em] text-chrome-500 uppercase">Your price</p>
            {vehicle && price != null ? (
              <>
                <p className="font-display text-4xl leading-tight font-bold whitespace-nowrap text-gold-ink">
                  {formatPrice(price)}
                </p>
                <p className="text-xs text-chrome-500">
                  {vehicle.label} · {vehicleClassLabel(vehicle.vehicleClass)}
                </p>
              </>
            ) : vehicle ? (
              <p className="mt-1 text-sm text-chrome-300">Price on request for this car — book and we&apos;ll confirm.</p>
            ) : (
              <>
                <p className="font-display text-3xl leading-tight font-bold whitespace-nowrap text-chrome-100">
                  {fromPrice != null ? <><span className="text-base font-medium text-chrome-500">from </span>{formatPrice(fromPrice)}</> : '—'}
                </p>
                <p className="text-xs text-chrome-500">Pick your car for your exact price</p>
              </>
            )}
          </div>
          <Button
            size="lg"
            className="h-14 w-full text-base font-semibold shadow-lg shadow-gold-500/30 dk:rounded-md dk:tracking-wider dk:uppercase"
            render={<Link href={buildQuoteHref(vehicle, service?.id ?? null)} />}
          >
            Book this
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border pt-4 text-sm">
        <p className="flex items-center gap-2 text-chrome-500">
          <ShieldCheck className="size-4 text-gold" />
          {WARRANTY_YEARS}-year results warranty
        </p>
        <Link href="/quote/not-listed" className="font-semibold text-gold-ink underline-offset-4 hover:underline">
          Can&apos;t find your car? Choose the type yourself
        </Link>
      </div>
    </section>
  )
}
