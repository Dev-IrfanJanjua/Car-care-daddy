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

export async function togglePartnerActive(partnerId: string, isActive: boolean) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('partners')
    .update({ is_active: isActive })
    .eq('id', partnerId)
  if (error) throw error

  revalidatePath('/admin/partners')
}
