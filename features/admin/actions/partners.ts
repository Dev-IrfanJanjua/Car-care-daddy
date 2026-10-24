'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import type { Database } from '@/lib/types/database.types'

type PartnerType = Database['public']['Enums']['partner_type']

export async function createPartner(formData: FormData) {
  const { supabase } = await requireAdmin()

  const name = String(formData.get('name') || '')
  const type = String(formData.get('type')) as PartnerType
  const contactName = String(formData.get('contactName') || '') || null
  const contactEmail = String(formData.get('contactEmail') || '') || null
  const contactPhone = String(formData.get('contactPhone') || '') || null
  const commissionRateRaw = formData.get('commissionRate')
  const commissionRate = commissionRateRaw ? Number(commissionRateRaw) : null

  const { error } = await supabase.from('partners').insert({
    name,
    type,
    contact_name: contactName,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    commission_rate: commissionRate,
  })
  if (error) throw error

  revalidatePath('/admin/partners')
}

// Partners were create-only; `notes` in particular had a column but no field.
export async function updatePartner(partnerId: string, formData: FormData) {
  const { supabase } = await requireAdmin()

  const name = String(formData.get('name') || '').trim()
  if (!name) throw new Error('Name is required')

  const type = String(formData.get('type')) as PartnerType
  const contactName = String(formData.get('contactName') || '').trim() || null
  const contactEmail = String(formData.get('contactEmail') || '').trim() || null
  const contactPhone = String(formData.get('contactPhone') || '').trim() || null
  const notes = String(formData.get('notes') || '').trim() || null

  const rateRaw = String(formData.get('commissionRate') || '').trim()
  const rateNum = Number(rateRaw)
  const commissionRate =
    rateRaw !== '' && Number.isFinite(rateNum) && rateNum >= 0 ? rateNum : null

  const { error } = await supabase
    .from('partners')
    .update({
      name,
      type,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      commission_rate: commissionRate,
      notes,
    })
    .eq('id', partnerId)
  if (error) throw error

  revalidatePath(`/admin/partners/${partnerId}`)
  revalidatePath('/admin/partners')
}

export async function togglePartnerActive(partnerId: string, isActive: boolean) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('partners')
    .update({ is_active: isActive })
    .eq('id', partnerId)
  if (error) throw error

  revalidatePath('/admin/partners')
}
