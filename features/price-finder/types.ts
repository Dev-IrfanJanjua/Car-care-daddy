export type FinderVehicle = {
  id: string
  make: string
  model: string
  /** "Toyota Corolla" -- what the customer types against and sees. */
  label: string
  vehicleClass: string
}

export type FinderService = {
  id: string
  name: string
  /** price per vehicle class, in whole rupees */
  prices: Record<string, number>
}

export type PriceFinderData = {
  vehicles: FinderVehicle[]
  services: FinderService[]
  /** model names offered as one-tap chips */
  quickPicks: string[]
}
