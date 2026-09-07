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

type Service = {
  id: string
  name: string
  description: string | null
  category: string | null
  price: number
  is_package: boolean
  coming_soon: boolean
}

function categoryLabel(category: string | null) {
  if (!category) return 'Other'
  return category.charAt(0).toUpperCase() + category.slice(1)
}

export function ServiceSelector({
  services,
  vehicleParams,
  initialSelectedIds = [],
}: {
  services: Service[]
  vehicleParams: { make: string; model: string; year: string; class: string }
  initialSelectedIds?: string[]
}) {
  const router = useRouter()

  const bookable = useMemo(() => services.filter((s) => !s.coming_soon), [services])

  // A coming-soon id can only arrive from a stale or hand-edited URL; drop it
  // here so it never reaches the quote.
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelectedIds.filter((id) => bookable.some((s) => s.id === id)))
  )

  const total = useMemo(
    () => bookable.filter((s) => selected.has(s.id)).reduce((sum, s) => sum + s.price, 0),
    [bookable, selected]
  )

  const groups = useMemo(() => {
    const byCategory = new Map<string, Service[]>()
    for (const s of services) {
      const label = categoryLabel(s.category)
      if (!byCategory.has(label)) byCategory.set(label, [])
      byCategory.get(label)!.push(s)
    }
    return Array.from(byCategory.entries())
  }, [services])

  // The package and the individual services it contains are mutually exclusive
  // in both directions. Full Glass Polishing already includes windshield and
  // headlight restoration, so any combination of the two would bill the same
  // work twice.
  function toggle(service: Service, checked: boolean) {
    setSelected((prev) => {
      if (!checked) {
        const next = new Set(prev)
        next.delete(service.id)
        return next
      }

      // Ticking the package replaces the whole selection.
      if (service.is_package) return new Set([service.id])

      // Ticking an individual service drops any package that contains it.
      const next = new Set(prev)
      next.add(service.id)
      for (const s of bookable) {
        if (s.is_package) next.delete(s.id)
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
    })
    router.push(`/quote/summary?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                      {s.is_package && (
                        <span className="mt-1 block text-xs text-muted-foreground">
                          Includes windshield and headlight restoration — pick this
                          instead of them, not as well.
                        </span>
                      )}
                    </span>
                    <span className="font-semibold tabular-nums">{formatPrice(s.price)}</span>
                  </>
                )

                // The package is a radio and the individual services are
                // checkboxes, because that is precisely what they do: tick as
                // many individual services as you like, or take the one package
                // instead of them. The control should say that up front rather
                // than leaving the customer to discover it by clicking.
                //
                // role="radio" on a button rather than a native radio group: a
                // native radio cannot be unticked, which would trap anyone who
                // picked the package and then changed their mind.
                if (s.is_package) {
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
                      <Checkbox
                        id={`service-${s.id}`}
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
        <span className="text-lg font-bold tabular-nums">{formatPrice(total)}</span>
      </div>

      <Button
        type="submit"
        disabled={selected.size === 0}
        size="lg"
        className="h-11 w-full text-base"
      >
        See my quote
        <ArrowRight className="size-4" data-icon="inline-end" />
      </Button>
    </form>
  )
}
