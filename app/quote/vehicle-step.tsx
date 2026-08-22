'use client'

import { useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Calendar, Car, ListChecks } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  const [makeId, setMakeId] = useState(
    () => makes.find((m) => m.name === initialMake)?.id ?? ''
  )
  const [modelId, setModelId] = useState(
    () => models.find((m) => m.name === initialModel && m.make_id === makeId)?.id ?? ''
  )
  const [year, setYear] = useState(initialYear ?? '')

  const modelsForMake = useMemo(() => models.filter((m) => m.make_id === makeId), [models, makeId])
  const selectedMake = makes.find((m) => m.id === makeId)
  const selectedModel = modelsForMake.find((m) => m.id === modelId)
  const canSubmit = Boolean(selectedMake && selectedModel && year.length === 4)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedMake || !selectedModel) return

    const params = new URLSearchParams({
      make: selectedMake.name,
      model: selectedModel.name,
      year,
      class: selectedModel.vehicle_class,
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
        <Select
          value={makeId}
          onValueChange={(value) => {
            setMakeId(value ?? '')
            setModelId('')
          }}
        >
          <SelectTrigger id="make" className="h-11 w-full">
            {/* Base UI: a `children` function overrides the `placeholder` prop
                entirely, so the empty case must be handled here -- otherwise the
                trigger renders blank with no hint of what to pick. */}
            <SelectValue>
              {(value: string | null) =>
                makes.find((m) => m.id === value)?.name ?? (
                  <span className="text-muted-foreground">Select a car brand</span>
                )
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {makes.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="model" className="flex items-center gap-1.5">
          <ListChecks className="size-3.5 text-brand" />
          Model
        </Label>
        <Select
          value={modelId}
          onValueChange={(value) => setModelId(value ?? '')}
          disabled={!makeId}
        >
          <SelectTrigger id="model" className="h-11 w-full">
            <SelectValue>
              {(value: string | null) =>
                modelsForMake.find((m) => m.id === value)?.name ?? (
                  <span className="text-muted-foreground">Select a model</span>
                )
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {modelsForMake.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!makeId && <p className="text-xs text-muted-foreground">Choose a car brand first.</p>}
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
