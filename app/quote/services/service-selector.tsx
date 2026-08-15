'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

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

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
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
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <ul className="space-y-3">
        {services.map((s) => (
          <li key={s.id}>
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-4 hover:bg-muted">
              <input
                type="checkbox"
                checked={selected.has(s.id)}
                onChange={() => toggle(s.id)}
                className="mt-1"
              />
              <span className="flex-1">
                <span className="block font-medium">{s.name}</span>
                {s.description && (
                  <span className="block text-sm text-muted-foreground">{s.description}</span>
                )}
              </span>
              <span className="font-semibold">${s.price.toFixed(2)}</span>
            </label>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-lg font-bold">${total.toFixed(2)}</span>
      </div>

      <button
        type="submit"
        disabled={selected.size === 0}
        className="w-full rounded-md bg-brand px-4 py-2.5 font-semibold text-brand-foreground disabled:opacity-50"
      >
        See my quote
      </button>
    </form>
  )
}
