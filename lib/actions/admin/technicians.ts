'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import type { Database } from '@/lib/types/database.types'

type TechnicianStatus = Database['public']['Enums']['technician_status']

export async function createTechnician(formData: FormData) {
  const { supabase } = await requireAdmin()

  const fullName = String(formData.get('fullName') || '')
  const email = String(formData.get('email') || '') || null
  const phone = String(formData.get('phone') || '') || null

  const { error } = await supabase
    .from('technicians')
    .insert({ full_name: fullName, email, phone })
  if (error) throw error

  revalidatePath('/admin/technicians')
}

export async function updateTechnicianStatus(technicianId: string, formData: FormData) {
  const { supabase } = await requireAdmin()
  const status = String(formData.get('status')) as TechnicianStatus

  const { error } = await supabase.from('technicians').update({ status }).eq('id', technicianId)
  if (error) throw error

  revalidatePath(`/admin/technicians/${technicianId}`)
  revalidatePath('/admin/technicians')
}
