'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import type { Database } from '@/lib/types/database.types'

type VehicleClass = Database['public']['Enums']['vehicle_class']

export async function updateServicePrices(formData: FormData) {
  const { supabase } = await requireAdmin()

  const updates: { serviceId: string; vehicleClass: string; basePrice: number }[] = []
  for (const [key, value] of formData.entries()) {
    const match = key.match(/^price:(.+):(.+)$/)
    if (!match) continue
    const [, serviceId, vehicleClass] = match
    const basePrice = Number(value)
    if (Number.isFinite(basePrice)) {
      updates.push({ serviceId, vehicleClass, basePrice })
    }
  }

  const results = await Promise.all(
    updates.map((u) =>
      supabase
        .from('service_prices')
        .update({ base_price: u.basePrice })
        .eq('service_id', u.serviceId)
        .eq('vehicle_class', u.vehicleClass as VehicleClass)
    )
  )
  const firstError = results.find((r) => r.error)?.error
  if (firstError) throw firstError

  revalidatePath('/admin/settings/services')
}

export async function toggleServiceActive(serviceId: string, isActive: boolean) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('services')
    .update({ is_active: isActive })
    .eq('id', serviceId)
  if (error) throw error

  revalidatePath('/admin/settings/services')
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
