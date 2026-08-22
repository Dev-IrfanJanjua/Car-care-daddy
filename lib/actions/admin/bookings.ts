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

// Moving an appointment is the most common day-to-day change and previously had
// no UI at all. `scheduledAt` arrives as a UTC ISO string built on the client,
// so the customer's wall-clock time survives the trip.
export async function rescheduleBooking(bookingId: string, scheduledAt: string) {
  const { supabase } = await requireAdmin()

  const when = new Date(scheduledAt)
  if (Number.isNaN(when.getTime())) {
    throw new Error('Pick a valid date and time')
  }

  const { error } = await supabase
    .from('bookings')
    .update({ scheduled_at: when.toISOString() })
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
