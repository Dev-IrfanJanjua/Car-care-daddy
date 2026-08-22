'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { VEHICLE_CLASSES, type VehicleClass } from '@/lib/vehicles/classes'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function revalidateCatalog() {
  revalidatePath('/admin/settings/services')
  revalidatePath('/quote/services')
  revalidatePath('/')
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export async function createService(formData: FormData) {
  const { supabase } = await requireAdmin()

  const name = String(formData.get('name') || '').trim()
  if (!name) throw new Error('Service name is required')

  const description = String(formData.get('description') || '').trim() || null
  const category = String(formData.get('category') || '').trim() || null
  const sortRaw = Number(formData.get('sortOrder'))
  const sortOrder = Number.isFinite(sortRaw) ? sortRaw : 0
  const slug = slugify(String(formData.get('slug') || '') || name)

  const { data: service, error } = await supabase
    .from('services')
    .insert({ name, slug, description, category, sort_order: sortOrder })
    .select('id')
    .single()

  if (error?.code === '23505') {
    throw new Error(`A service with the slug "${slug}" already exists.`)
  }
  if (error) throw error

  // Seed a price row for every vehicle class immediately. Both the customer
  // service list and calculate-quote filter out services with no price row for
  // the selected class, so without these the new service would be invisible --
  // and, before the upsert fix, unpriceable through the UI as well.
  const { error: pricesError } = await supabase.from('service_prices').insert(
    VEHICLE_CLASSES.map((vehicleClass) => ({
      service_id: service.id,
      vehicle_class: vehicleClass,
      base_price: 0,
    }))
  )
  if (pricesError) throw pricesError

  revalidateCatalog()
}

export async function updateService(serviceId: string, formData: FormData) {
  const { supabase } = await requireAdmin()

  const name = String(formData.get('name') || '').trim()
  if (!name) throw new Error('Service name is required')

  const description = String(formData.get('description') || '').trim() || null
  const category = String(formData.get('category') || '').trim() || null
  const sortRaw = Number(formData.get('sortOrder'))
  const sortOrder = Number.isFinite(sortRaw) ? sortRaw : 0

  const { error } = await supabase
    .from('services')
    .update({ name, description, category, sort_order: sortOrder })
    .eq('id', serviceId)
  if (error) throw error

  revalidateCatalog()
}

export async function toggleServiceActive(serviceId: string, isActive: boolean) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('services')
    .update({ is_active: isActive })
    .eq('id', serviceId)
  if (error) throw error

  revalidateCatalog()
}

// ---------------------------------------------------------------------------
// Vehicle catalog
// ---------------------------------------------------------------------------

function revalidateVehicles() {
  revalidatePath('/admin/settings/vehicles')
  revalidatePath('/quote')
}

export async function createVehicleMake(formData: FormData) {
  const { supabase } = await requireAdmin()

  const name = String(formData.get('name') || '').trim()
  if (!name) throw new Error('Make name is required')

  const { error } = await supabase.from('vehicle_makes').insert({ name })
  if (error?.code === '23505') {
    throw new Error(`"${name}" already exists.`)
  }
  if (error) throw error

  revalidateVehicles()
}

export async function createVehicleModel(formData: FormData) {
  const { supabase } = await requireAdmin()

  const makeId = String(formData.get('makeId') || '')
  const name = String(formData.get('name') || '').trim()
  const vehicleClass = String(formData.get('vehicleClass')) as VehicleClass

  if (!makeId) throw new Error('Pick a make')
  if (!name) throw new Error('Model name is required')
  if (!VEHICLE_CLASSES.includes(vehicleClass)) throw new Error('Pick a vehicle class')

  const { error } = await supabase
    .from('vehicle_models')
    .insert({ make_id: makeId, name, vehicle_class: vehicleClass })

  if (error?.code === '23505') {
    throw new Error(`That make already has a model called "${name}".`)
  }
  if (error) throw error

  revalidateVehicles()
}

// vehicle_class drives every price for this model, so this is the one field
// worth being able to correct after the fact.
export async function updateVehicleModelClass(modelId: string, formData: FormData) {
  const { supabase } = await requireAdmin()

  const vehicleClass = String(formData.get('vehicleClass')) as VehicleClass
  if (!VEHICLE_CLASSES.includes(vehicleClass)) throw new Error('Pick a vehicle class')

  const { error } = await supabase
    .from('vehicle_models')
    .update({ vehicle_class: vehicleClass })
    .eq('id', modelId)
  if (error) throw error

  revalidateVehicles()
}
