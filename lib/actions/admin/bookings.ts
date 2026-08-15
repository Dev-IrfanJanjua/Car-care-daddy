'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import type { Database } from '@/lib/types/database.types'

type BookingStatus = Database['public']['Enums']['booking_status']

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId)
  if (error) throw error

  revalidatePath(`/admin/bookings/${bookingId}`)
  revalidatePath('/admin/bookings')
}

export async function assignTechnician(bookingId: string, technicianId: string | null) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('bookings')
    .update({ assigned_technician_id: technicianId })
    .eq('id', bookingId)
  if (error) throw error

  revalidatePath(`/admin/bookings/${bookingId}`)
  revalidatePath('/admin/bookings')
}

export async function updateBookingNotes(bookingId: string, notes: string) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase.from('bookings').update({ notes }).eq('id', bookingId)
  if (error) throw error

  revalidatePath(`/admin/bookings/${bookingId}`)
}
