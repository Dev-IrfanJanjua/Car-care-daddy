'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'

type Service = {
  id: string
  name: string
  description: string | null
  category: string | null
  price: number
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
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initialSelectedIds))

  const total = useMemo(
    () => services.filter((s) => selected.has(s.id)).reduce((sum, s) => sum + s.price, 0),
    [services, selected]
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

  function toggle(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
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
                return (
                  <li key={s.id}>
                    <Label
                      htmlFor={`service-${s.id}`}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-lg border p-4 font-normal transition-colors',
                        checked
                          ? 'border-brand bg-brand/5 ring-1 ring-brand/30'
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      <Checkbox
                        id={`service-${s.id}`}
                        checked={checked}
                        onCheckedChange={(c) => toggle(s.id, c === true)}
                        className="mt-0.5"
                      />
                      <span className="flex-1">
                        <span className="block font-medium">{s.name}</span>
                        {s.description && (
                          <span className="mt-0.5 block text-sm text-muted-foreground">
                            {s.description}
                          </span>
                        )}
                      </span>
                      <span className="font-semibold tabular-nums">{formatPrice(s.price)}</span>
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

      <Button type="submit" disabled={selected.size === 0} size="lg" className="h-11 w-full text-base">
        See my quote
        <ArrowRight className="size-4" data-icon="inline-end" />
      </Button>
    </form>
  )
}
