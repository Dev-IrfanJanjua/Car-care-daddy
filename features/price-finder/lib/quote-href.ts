import type { FinderVehicle } from '../types'

/**
 * Hand-off into the existing quote flow. /quote pre-fills the brand and model
 * and asks only for the year -- the one thing we cannot know -- then carries the
 * chosen service through to the service step.
 */
export function buildQuoteHref(vehicle: FinderVehicle | null, serviceId: string | null) {
  if (!vehicle) return '/quote'
  const params = new URLSearchParams({ make: vehicle.make, model: vehicle.model })
  if (serviceId) params.set('services', serviceId)
  return `/quote?${params.toString()}`
}
