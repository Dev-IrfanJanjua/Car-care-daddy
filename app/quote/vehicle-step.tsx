'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
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

export function VehicleStep({ makes, models }: { makes: Make[]; models: Model[] }) {
  const router = useRouter()
  const [makeId, setMakeId] = useState('')
  const [modelId, setModelId] = useState('')
  const [year, setYear] = useState('')

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="make">Make</Label>
        <Select
          value={makeId}
          onValueChange={(value) => {
            setMakeId(value ?? '')
            setModelId('')
          }}
        >
          <SelectTrigger id="make" className="w-full">
            <SelectValue placeholder="Select a make">
              {(value) => makes.find((m) => m.id === value)?.name}
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
        <Label htmlFor="model">Model</Label>
        <Select
          value={modelId}
          onValueChange={(value) => setModelId(value ?? '')}
          disabled={!makeId}
        >
          <SelectTrigger id="model" className="w-full">
            <SelectValue placeholder="Select a model">
              {(value) => modelsForMake.find((m) => m.id === value)?.name}
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
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="year">Year</Label>
        <Input
          id="year"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          min={1990}
          max={new Date().getFullYear() + 1}
          placeholder="2022"
          required
        />
      </div>

      <Button type="submit" disabled={!canSubmit} className="w-full">
        Continue
      </Button>
    </form>
  )
}
