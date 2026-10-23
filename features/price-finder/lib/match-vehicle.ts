import type { FinderVehicle } from '../types'

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()

/**
 * Forgiving search over "Make Model". Every word the customer typed must appear
 * somewhere in the label, in any order ("corolla toyota" finds Toyota Corolla).
 * Labels that start with the query rank first, then shorter labels.
 */
export function searchVehicles(vehicles: FinderVehicle[], query: string, limit = 6): FinderVehicle[] {
  const q = normalise(query)
  if (!q) return []
  const words = q.split(' ')

  return vehicles
    .map((v) => ({ v, label: normalise(v.label) }))
    .filter(({ label }) => words.every((w) => label.includes(w)))
    .sort((a, b) => {
      const as = a.label.startsWith(q) || normalise(a.v.model).startsWith(q) ? 0 : 1
      const bs = b.label.startsWith(q) || normalise(b.v.model).startsWith(q) ? 0 : 1
      return as - bs || a.label.length - b.label.length
    })
    .slice(0, limit)
    .map(({ v }) => v)
}

/** The vehicle whose model name is exactly `model` (for the quick-pick chips). */
export function findByModelName(vehicles: FinderVehicle[], model: string) {
  const m = normalise(model)
  return vehicles.find((v) => normalise(v.model) === m) ?? null
}
