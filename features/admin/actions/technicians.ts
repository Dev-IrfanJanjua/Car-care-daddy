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

// Contact details and skills were write-once before this -- only status could
// be changed after creation.
export async function updateTechnician(technicianId: string, formData: FormData) {
  const { supabase } = await requireAdmin()

  const fullName = String(formData.get('fullName') || '').trim()
  if (!fullName) throw new Error('Name is required')

  const email = String(formData.get('email') || '').trim() || null
  const phone = String(formData.get('phone') || '').trim() || null
  const photoUrl = String(formData.get('photoUrl') || '').trim() || null

  // Comma-separated in the form, text[] in the column.
  const skillsRaw = String(formData.get('skills') || '')
  const skills = skillsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const { error } = await supabase
    .from('technicians')
    .update({
      full_name: fullName,
      email,
      phone,
      photo_url: photoUrl,
      skills: skills.length ? skills : null,
    })
    .eq('id', technicianId)
  if (error) throw error

  revalidatePath(`/admin/technicians/${technicianId}`)
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
