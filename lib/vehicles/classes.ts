import type { Database } from '@/lib/types/database.types'

export type VehicleClass = Database['public']['Enums']['vehicle_class']

// The four car types a price is quoted for (see 0018/0019).
//
// The enum still carries legacy labels (compact/standard/large and the original
// US sedan/coupe/suv/van/truck/luxury) -- Postgres can't drop an enum label
// without recreating the type and every dependent column, so they were left in
// place and simply retired. Only these four are ever offered or priced.
export const VEHICLE_CLASSES: VehicleClass[] = ['hatchback', 'sedan', 'crossover', 'suv']

export const VEHICLE_TYPES: { id: VehicleClass; name: string; desc: string; examples: string }[] = [
  {
    id: 'hatchback',
    name: 'Hatchback',
    desc: 'Small, compact body with a rear hatch door and a short boot.',
    examples: 'Suzuki Alto, Cultus, Wagon R, Toyota Vitz',
  },
  {
    id: 'sedan',
    name: 'Sedan',
    desc: 'Three-box shape — engine, cabin and a separate boot.',
    examples: 'Toyota Corolla, Honda Civic, Honda City, Toyota Yaris',
  },
  {
    id: 'crossover',
    name: 'Crossover',
    desc: 'Car-based and raised, with a hatch-style rear — a mix of SUV and hatchback.',
    examples: 'Honda HR-V, KIA Sportage, Hyundai Tucson, MG HS',
  },
  {
    id: 'suv',
    name: 'SUV',
    desc: 'Large, tall and rugged — usually 7 seats or built for rough roads.',
    examples: 'Toyota Fortuner, Land Cruiser, Prado, Pajero',
  },
]

export const VEHICLE_CLASS_LABELS: Record<string, string> = {
  hatchback: 'Hatchback',
  sedan: 'Sedan',
  crossover: 'Crossover',
  suv: 'SUV',
  // retired tiers, kept so old bookings still read sensibly
  compact: 'Hatchback',
  standard: 'Sedan',
  large: 'SUV',
}

export function vehicleClassLabel(value: string) {
  return VEHICLE_CLASS_LABELS[value] ?? value
}
