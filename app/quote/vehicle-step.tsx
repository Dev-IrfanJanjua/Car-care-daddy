'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

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
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="make" className="block text-sm font-medium">
          Make
        </label>
        <select
          id="make"
          value={makeId}
          onChange={(e) => {
            setMakeId(e.target.value)
            setModelId('')
          }}
          required
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
        >
          <option value="">Select a make</option>
          {makes.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="model" className="block text-sm font-medium">
          Model
        </label>
        <select
          id="model"
          value={modelId}
          onChange={(e) => setModelId(e.target.value)}
          disabled={!makeId}
          required
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 disabled:opacity-50"
        >
          <option value="">Select a model</option>
          {modelsForMake.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="year" className="block text-sm font-medium">
          Year
        </label>
        <input
          id="year"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          min={1990}
          max={new Date().getFullYear() + 1}
          placeholder="2022"
          required
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-md bg-brand px-4 py-2.5 font-semibold text-brand-foreground disabled:opacity-50"
      >
        Continue
      </button>
    </form>
  )
}
