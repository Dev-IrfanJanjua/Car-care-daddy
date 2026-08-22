'use client'

import { useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Calendar, Car, ListChecks } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'

type Make = { id: string; name: string }
type Model = { id: string; make_id: string; name: string; vehicle_class: string }

export function VehicleStep({
  makes,
  models,
  initialMake,
  initialModel,
  initialYear,
}: {
  makes: Make[]
  models: Model[]
  initialMake?: string
  initialModel?: string
  initialYear?: string
}) {
  const router = useRouter()
  const [make, setMake] = useState<Make | null>(
    () => makes.find((m) => m.name === initialMake) ?? null
  )
  const [model, setModel] = useState<Model | null>(
    () => models.find((m) => m.name === initialModel && m.make_id === make?.id) ?? null
  )
  const [year, setYear] = useState(initialYear ?? '')

  const modelsForMake = useMemo(
    () => (make ? models.filter((m) => m.make_id === make.id) : []),
    [models, make]
  )
  const canSubmit = Boolean(make && model && year.length === 4)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!make || !model) return

    const params = new URLSearchParams({
      make: make.name,
      model: model.name,
      year,
      class: model.vehicle_class,
    })
    router.push(`/quote/services?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="make" className="flex items-center gap-1.5">
          <Car className="size-3.5 text-brand" />
          Car Brand
        </Label>
        {/* items= is what Base UI filters against as the customer types; the
            chevron still opens the full list for anyone who'd rather browse. */}
        <Combobox
          items={makes}
          value={make}
          onValueChange={(value) => {
            setMake(value)
            setModel(null) // a model from the old brand would be wrong
          }}
          itemToStringLabel={(m: Make) => m.name}
        >
          <ComboboxInput id="make" placeholder="Search or select a brand…" />
          <ComboboxContent>
            <ComboboxEmpty>
              No brand matches that.{' '}
              <Link href="/quote/not-listed" className="font-medium text-brand hover:underline">
                Request a quote by hand
              </Link>
            </ComboboxEmpty>
            <ComboboxList>
              {(m: Make) => (
                <ComboboxItem key={m.id} value={m}>
                  {m.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="model" className="flex items-center gap-1.5">
          <ListChecks className="size-3.5 text-brand" />
          Model
        </Label>
        <Combobox
          items={modelsForMake}
          value={model}
          onValueChange={setModel}
          itemToStringLabel={(m: Model) => m.name}
          disabled={!make}
        >
          <ComboboxInput
            id="model"
            placeholder={make ? 'Search or select a model…' : 'Choose a car brand first'}
          />
          <ComboboxContent>
            <ComboboxEmpty>
              No model matches that.{' '}
              <Link href="/quote/not-listed" className="font-medium text-brand hover:underline">
                Request a quote by hand
              </Link>
            </ComboboxEmpty>
            <ComboboxList>
              {(m: Model) => (
                <ComboboxItem key={m.id} value={m}>
                  {m.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="year" className="flex items-center gap-1.5">
          <Calendar className="size-3.5 text-brand" />
          Year
        </Label>
        <Input
          id="year"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          min={1990}
          max={new Date().getFullYear() + 1}
          placeholder="2022"
          className="h-11"
          required
        />
      </div>

      <Button type="submit" disabled={!canSubmit} size="lg" className="h-11 w-full text-base">
        Continue
        <ArrowRight className="size-4" data-icon="inline-end" />
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Can&apos;t find your car?{' '}
        <Link href="/quote/not-listed" className="font-medium text-brand hover:underline">
          Request a quote by hand
        </Link>
      </p>
    </form>
  )
}
