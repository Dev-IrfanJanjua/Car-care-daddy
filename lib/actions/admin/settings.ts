'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { SERVICE_CATALOG_TAG } from '@/lib/pricing/service-catalog'
import type { Database } from '@/lib/types/database.types'

type VehicleClass = Database['public']['Enums']['vehicle_class']

export async function updateServicePrices(formData: FormData) {
  const { supabase } = await requireAdmin()

  const rows: { service_id: string; vehicle_class: VehicleClass; base_price: number }[] = []
  for (const [key, value] of formData.entries()) {
    const match = key.match(/^price:(.+):(.+)$/)
    if (!match) continue
    const [, serviceId, vehicleClass] = match

    // A blank cell means "leave this alone". Without this guard Number('') is 0
    // and Number.isFinite(0) is true, so clearing a field silently priced the
    // service at $0.00.
    const raw = String(value).trim()
    if (raw === '') continue

    const basePrice = Number(raw)
    if (!Number.isFinite(basePrice) || basePrice < 0) continue

    rows.push({
      service_id: serviceId,
      vehicle_class: vehicleClass as VehicleClass,
      base_price: basePrice,
    })
  }

  if (rows.length === 0) {
    revalidatePath('/admin/settings/services')
    return
  }

  // Upsert, not update: a service created without its price rows had no row to
  // match, so editing its price silently affected zero rows. The unique
  // (service_id, vehicle_class) constraint backs the conflict target.
  const { error } = await supabase
    .from('service_prices')
    .upsert(rows, { onConflict: 'service_id,vehicle_class' })
  if (error) throw error

  // Prices are served from the cached catalog, so the tag -- not the paths --
  // is what makes an edit take effect. updateTag rather than revalidateTag so
  // the admin sees the new figures immediately after saving.
  updateTag(SERVICE_CATALOG_TAG)
  revalidatePath('/admin/settings/services')
  revalidatePath('/quote/services')
}

export async function updateBusinessSettings(formData: FormData) {
  const { supabase } = await requireAdmin()

  const businessName = String(formData.get('businessName') || '')
  const contactEmail = String(formData.get('contactEmail') || '') || null
  const contactPhone = String(formData.get('contactPhone') || '') || null

  const { error } = await supabase
    .from('business_settings')
    .update({
      business_name: businessName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
    })
    .eq('id', true)
  if (error) throw error

  revalidatePath('/admin/settings')
}

// hours and service_area are schemaless jsonb columns that previously had no UI
// at all -- they were seeded once and only changeable via SQL. These write the
// same shapes the seed uses, so nothing downstream has to change.
export async function updateBusinessHours(formData: FormData) {
  const { supabase } = await requireAdmin()

  const hours = {
    mon_fri: String(formData.get('monFri') || ''),
    sat: String(formData.get('sat') || ''),
    sun: String(formData.get('sun') || ''),
  }

  const { error } = await supabase.from('business_settings').update({ hours }).eq('id', true)
  if (error) throw error

  revalidatePath('/admin/settings')
}

export async function updateServiceArea(formData: FormData) {
  const { supabase } = await requireAdmin()

  const centerZip = String(formData.get('centerZip') || '')
  const radiusRaw = Number(formData.get('radiusMiles'))
  const radiusMiles = Number.isFinite(radiusRaw) && radiusRaw > 0 ? radiusRaw : 25

  const { error } = await supabase
    .from('business_settings')
    .update({ service_area: { type: 'radius', center_zip: centerZip, radius_miles: radiusMiles } })
    .eq('id', true)
  if (error) throw error

  revalidatePath('/admin/settings')
}
