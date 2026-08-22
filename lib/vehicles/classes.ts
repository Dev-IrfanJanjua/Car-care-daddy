import type { Database } from '@/lib/types/database.types'

export type VehicleClass = Database['public']['Enums']['vehicle_class']

// Kept in sync with the vehicle_class enum in 0001_init_schema.sql. Lives here
// rather than alongside the admin actions because a 'use server' module can
// only export async functions.
export const VEHICLE_CLASSES: VehicleClass[] = [
  'sedan',
  'coupe',
  'suv',
  'van',
  'truck',
  'luxury',
]
