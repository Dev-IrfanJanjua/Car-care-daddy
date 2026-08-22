import type { Database } from '@/lib/types/database.types'

export type VehicleClass = Database['public']['Enums']['vehicle_class']

// The three real price tiers (see 0007_pkr_price_tiers.sql).
//
// The enum still carries six legacy labels (sedan/coupe/suv/van/truck/luxury)
// from the original US seed data -- Postgres can't drop an enum label without
// recreating the type and every dependent column, so they were left in place
// and simply retired. Only these three are ever offered or priced.
export const VEHICLE_CLASSES: VehicleClass[] = ['compact', 'standard', 'large']

export const VEHICLE_CLASS_LABELS: Record<string, string> = {
  compact: 'Compact',
  standard: 'Standard',
  large: 'Large / Luxury',
}

export function vehicleClassLabel(value: string) {
  return VEHICLE_CLASS_LABELS[value] ?? value
}
