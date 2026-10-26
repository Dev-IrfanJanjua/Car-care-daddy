import type { FinderVehicle } from '../types'

/**
 * Hand-off into step 1 of the booking flow (/quote), which opens with the car
 * and service already chosen; only the year is left to pick.
 */
export function buildQuoteHref(vehicle: FinderVehicle | null, serviceId: string | null) {
  if (!vehicle) return '/quote'
  // A car type picked by hand (not a model): the step opens with it selected.
  if (vehicle.id.startsWith('type-')) {
    const params = new URLSearchParams({ class: vehicle.vehicleClass })
    if (serviceId) params.set('services', serviceId)
    return `/quote?${params.toString()}`
  }
  const params = new URLSearchParams({ make: vehicle.make, model: vehicle.model })
  if (serviceId) params.set('services', serviceId)
  return `/quote?${params.toString()}`
}
