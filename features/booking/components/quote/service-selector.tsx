'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, Clock } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'
import { applyDiscount } from '@/features/bundles'

type Service = {
  id: string
  name: string
  description: string | null
  category: string | null
  price: number
  is_package: boolean
  coming_soon: boolean
  /** Services sharing a non-null group are alternatives -- see toggle(). */
  exclusive_group: string | null
}

function categoryLabel(category: string | null) {
  if (!category) return 'Other'
  return category.charAt(0).toUpperCase() + category.slice(1)
}

export function ServiceSelector({
  services,
  vehicleParams,
  initialSelectedIds = [],
  bundle,
}: {
  services: Service[]
  vehicleParams: { make: string; model: string; year: string; class: string }
  initialSelectedIds?: string[]
  /** set when the visitor came from a bundle card */
  bundle?: { id: string; name: string; percent: number; serviceIds: string[] }
}) {
  const router = useRouter()

  const bookable = useMemo(() => services.filter((s) => !s.coming_soon), [services])

  // A coming-soon id can only arrive from a stale or hand-edited URL; drop it
  // here so it never reaches the quote.
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelectedIds.filter((id) => bookable.some((s) => s.id === id)))
  )

  // The bundle price holds only while every service in the bundle is ticked;
  // un-ticking one drops it back to normal prices (the server re-checks this).
  const bundleOn = Boolean(bundle && bundle.percent > 0 && bundle.serviceIds.every((id) => selected.has(id)))

  const { total, saving } = useMemo(() => {
    const picked = bookable.filter((s) => selected.has(s.id))
    const list = picked.reduce((sum, s) => sum + s.price, 0)
    if (!bundleOn || !bundle) return { total: list, saving: 0 }
    const parts = picked.filter((s) => bundle.serviceIds.includes(s.id))
    const partsList = parts.reduce((sum, s) => sum + s.price, 0)
    const save = partsList - applyDiscount(partsList, bundle.percent)
    return { total: list - save, saving: save }
  }, [bookable, selected, bundleOn, bundle])

  const groups = useMemo(() => {
    const byCategory = new Map<string, Service[]>()
    for (const s of services) {
      const label = categoryLabel(s.category)
      if (!byCategory.has(label)) byCategory.set(label, [])
      byCategory.get(label)!.push(s)
    }
    return Array.from(byCategory.entries())
  }, [services])

  // Services sharing an exclusive_group are alternatives to each other, so
  // picking one drops the rest of that group -- Full Glass Polishing already
  // covers the windshield, and booking both would pay twice for the same glass.
  // Services outside the group are unaffected: headlights are separate work and
  // can be added to either.
  function toggle(service: Service, checked: boolean) {
    setSelected((prev) => {
      if (!checked) {
        const next = new Set(prev)
        next.delete(service.id)
        return next
      }

      const next = new Set(prev)
      next.add(service.id)
      if (service.exclusive_group) {
        for (const s of bookable) {
          if (s.id !== service.id && s.exclusive_group === service.exclusive_group) {
            next.delete(s.id)
          }
        }
      }
      return next
    })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (selected.size === 0) return

    const params = new URLSearchParams({
      ...vehicleParams,
      services: Array.from(selected).join(','),
      ...(bundleOn && bundle ? { bundle: bundle.id } : {}),
    })
    // The "review your quote" screen this used to lead to is gone -- prices
    // are already visible on every row above, so a whole extra step just to
    // repeat them was redundant. Straight into the booking wizard instead.
    router.push(`/book?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {bundle && (
        <p
          role="status"
          className={cn(
            'flex gap-2.5 rounded-lg border px-4 py-3 text-sm',
            bundleOn ? 'border-gold-500/50 bg-gold-500/10 text-foreground' : 'border-border text-muted-foreground'
          )}
        >
          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-ink" />
          <span>
            {bundleOn ? (
              <>
                <b>{bundle.name} bundle</b> — {bundle.percent}% off is applied to these services. Changing the services removes the bundle price.
              </>
            ) : (
              <>The {bundle.name} bundle price needs all of its services ticked.</>
            )}
          </span>
        </p>
      )}
      <div className="space-y-6">
        {groups.map(([category, items]) => (
          <div key={category} className="space-y-2.5">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {category}
            </h3>
            <ul className="space-y-2">
              {items.map((s) => {
                const checked = selected.has(s.id)

                if (s.coming_soon) {
                  return (
                    <li key={s.id}>
                      <div
                        aria-disabled
                        className="flex items-start gap-3 rounded-lg border border-dashed border-border p-4 opacity-70"
                      >
                        <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1">
                          <span className="block font-medium">{s.name}</span>
                          {s.description && (
                            <span className="mt-0.5 block text-sm text-muted-foreground">
                              {s.description}
                            </span>
                          )}
                        </span>
                        <Badge variant="secondary" className="shrink-0">
                          Coming soon
                        </Badge>
                      </div>
                    </li>
                  )
                }

                // Named rather than hardcoded, so the hint stays true if a third
                // glass treatment joins the group -- and so neither card tells
                // the customer it is an alternative to itself.
                const alternatives = s.exclusive_group
                  ? bookable
                      .filter(
                        (o) => o.id !== s.id && o.exclusive_group === s.exclusive_group
                      )
                      .map((o) => o.name)
                  : []

                const rowClass = cn(
                  'flex w-full cursor-pointer items-start gap-3 rounded-lg border p-4 text-left font-normal transition-colors',
                  checked
                    ? 'border-brand bg-brand/5 ring-1 ring-brand/30'
                    : 'border-border hover:bg-muted'
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
                      {s.description && (
                        <span className="mt-0.5 block text-sm text-muted-foreground">
                          {s.description}
                        </span>
                      )}
                      {alternatives.length > 0 && (
                        <span className="mt-1 block text-xs text-muted-foreground">
                          Alternative to {alternatives.join(' / ')} — they cover the same
                          glass, so only one applies.
                        </span>
                      )}
                    </span>
                    <span className="font-semibold tabular-nums">{formatPrice(s.price)}</span>
                  </>
                )

                // Anything in an exclusive group draws as a radio, everything
                // else as a checkbox, because that is precisely what they do:
                // one of the glass treatments, plus any add-ons you like. The
                // control should say that up front rather than leaving the
                // customer to discover it by clicking.
                //
                // role="radio" on a button rather than a native radio group: a
                // native radio cannot be unticked, which would trap anyone who
                // picked one and then changed their mind.
                if (s.exclusive_group) {
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        onClick={() => toggle(s, !checked)}
                        className={rowClass}
                      >
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
                    <Label htmlFor={`service-${s.id}`} className={rowClass}>
                      {/* `name` is load-bearing, not decoration. Base UI styles
                          the hidden input it pairs with the checkbox as
                          `position: fixed; top: 0; left: 0` when there is no
                          name, and `position: absolute` when there is. The
                          label's htmlFor points at that input, so clicking a
                          row focuses it -- and because this list sits inside
                          StepTransition's animated motion.div, a transformed
                          ancestor makes `fixed` resolve against that div rather
                          than the viewport. The browser then scrolled the page
                          up to the top of the card on every tick. */}
                      <Checkbox
                        id={`service-${s.id}`}
                        name={`service-${s.id}`}
                        checked={checked}
                        onCheckedChange={(c) => toggle(s, c === true)}
                        className="mt-0.5"
                      />
                      {body}
                    </Label>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {selected.size > 0 && <Check className="size-4 text-brand" />}
          {selected.size} service{selected.size === 1 ? '' : 's'} selected
        </span>
        <span className="text-right">
          {saving > 0 && <span className="block text-xs font-medium text-[#1a8f50]">Bundle saving −{formatPrice(saving)}</span>}
          <span className="text-lg font-bold tabular-nums">{formatPrice(total)}</span>
        </span>
      </div>

      <Button
        type="submit"
        disabled={selected.size === 0}
        size="lg"
        className="h-11 w-full text-base"
      >
        Next Step
        <ArrowRight className="size-4" data-icon="inline-end" />
      </Button>
    </form>
  )
}
