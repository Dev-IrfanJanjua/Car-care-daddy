'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { VEHICLE_TYPES } from '@/lib/vehicles/classes'
import { cn } from '@/lib/utils'

/**
 * For a car that isn't in the list: describe its body shape instead. Prices
 * depend only on the car type, so this gets exactly the same quote as picking
 * the model would -- nobody is turned away.
 */
export function VehicleTypePicker({ initialServices, initialBundle, initialType }: { initialServices?: string; initialBundle?: string; initialType?: string }) {
  const router = useRouter()
  const [type, setType] = useState<string | null>(() => (VEHICLE_TYPES.some((t) => t.id === initialType) ? (initialType as string) : null))
  const [car, setCar] = useState('')
  const [year, setYear] = useState('')

  const canSubmit = Boolean(type && year.length === 4)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!type) return
    const params = new URLSearchParams({
      make: 'Other',
      model: car.trim().slice(0, 60) || 'Not listed',
      year,
      class: type,
    })
    if (initialServices) params.set('services', initialServices)
    if (initialBundle) params.set('bundle', initialBundle)
    router.push(`/quote/services?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div role="radiogroup" aria-label="Car type" className="grid gap-3 sm:grid-cols-2">
        {VEHICLE_TYPES.map((t) => {
          const on = type === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setType(t.id)}
              className={cn(
                'relative rounded-xl border p-4 text-left transition-colors',
                on ? 'border-gold-500 bg-gold-500/10 ring-1 ring-gold-500/40' : 'border-border hover:bg-muted'
              )}
            >
              {on && (
                <span className="absolute top-3 right-3 grid size-5 place-items-center rounded-full bg-gold-500 text-gold-foreground">
                  <Check aria-hidden className="size-3" strokeWidth={3} />
                </span>
              )}
              <b className="block font-display text-base text-foreground">{t.name}</b>
              <span className="mt-1 block text-sm text-muted-foreground">{t.desc}</span>
              <span className="mt-2 block text-xs text-muted-foreground">e.g. {t.examples}</span>
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="car">Your car (optional)</Label>
          <Input id="car" value={car} maxLength={60} onChange={(e) => setCar(e.target.value)} placeholder="e.g. Subaru Outback" className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min={1950}
            max={new Date().getFullYear() + 1}
            placeholder="2022"
            className="h-11"
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={!canSubmit} size="lg" className="h-11 w-full text-base">
        Continue
        <ArrowRight className="size-4" data-icon="inline-end" />
      </Button>
    </form>
  )
}
