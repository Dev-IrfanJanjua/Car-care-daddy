'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'

type Service = {
  id: string
  name: string
  description: string | null
  category: string | null
  price: number
}

export function ServiceSelector({
  services,
  vehicleParams,
}: {
  services: Service[]
  vehicleParams: { make: string; model: string; year: string; class: string }
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const total = useMemo(
    () => services.filter((s) => selected.has(s.id)).reduce((sum, s) => sum + s.price, 0),
    [services, selected]
  )

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
      <ul className="space-y-3">
        {services.map((s) => (
          <li key={s.id}>
            <Label
              htmlFor={`service-${s.id}`}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-4 font-normal hover:bg-muted"
            >
              <Checkbox
                id={`service-${s.id}`}
                checked={selected.has(s.id)}
                onCheckedChange={(checked) => toggle(s.id, checked === true)}
                className="mt-0.5"
              />
              <span className="flex-1">
                <span className="block font-medium">{s.name}</span>
                {s.description && (
                  <span className="block text-sm text-muted-foreground">{s.description}</span>
                )}
              </span>
              <span className="font-semibold tabular-nums">${s.price.toFixed(2)}</span>
            </Label>
          </li>
        ))}
      </ul>

      <Separator />

      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-lg font-bold tabular-nums">${total.toFixed(2)}</span>
      </div>

      <Button type="submit" disabled={selected.size === 0} className="w-full">
        See my quote
      </Button>
    </form>
  )
}
