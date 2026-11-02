'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/lib/types/database.types'

type BookingStatus = Database['public']['Enums']['booking_status']

/**
 * Applies a patch to one booking and proves it landed.
 *
 * Every write here goes through the caller's own session, so RLS decides
 * whether the row is visible. A policy that filters the row out does NOT
 * produce an error -- PostgREST reports success having updated nothing, so
 * the UI cheerfully showed "Status updated" while the database was unchanged.
 * Asking for the row back turns that silent no-op into a real failure.
 */
async function patchBooking(
  bookingId: string,
  patch: Database['public']['Tables']['bookings']['Update']
) {
  const { supabase } = await requireAdmin()

  const { data, error } = await supabase
    .from('bookings')
    .update(patch)
    .eq('id', bookingId)
    .select('id')

  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error(
      'The booking was not updated. Your account can read this booking but not write to it, ' +
        'which points at a missing admin update policy on public.bookings.'
    )
  }

  revalidatePath(`/admin/bookings/${bookingId}`)
  revalidatePath('/admin/bookings')
  revalidatePath('/admin')
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  await patchBooking(bookingId, { status })
}

export async function assignTechnician(bookingId: string, technicianId: string | null) {
  await patchBooking(bookingId, { assigned_technician_id: technicianId })
}

// Moving an appointment is the most common day-to-day change and previously had
// no UI at all. `scheduledAt` arrives as a UTC ISO string built on the client,
// so the customer's wall-clock time survives the trip.
export async function rescheduleBooking(bookingId: string, scheduledAt: string) {
  const when = new Date(scheduledAt)
  if (Number.isNaN(when.getTime())) {
    throw new Error('Pick a valid date and time')
  }

  await patchBooking(bookingId, { scheduled_at: when.toISOString() })
}

export async function updateBookingNotes(bookingId: string, notes: string) {
  await patchBooking(bookingId, { notes })
}

/**
 * Permanently removes a booking and its line items. Admin-only (checked
 * above), and it uses the service-role client so a missing DELETE policy on
 * public.bookings can't turn it into a silent no-op.
 */
export async function deleteBooking(bookingId: string) {
  await requireAdmin()
  const admin = createAdminClient()

  // Children first, in case the foreign keys are not ON DELETE CASCADE.
  const items = await admin.from('booking_services').delete().eq('booking_id', bookingId)
  if (items.error) throw new Error(`Could not delete the booking items: ${items.error.message}`)

  const { data, error } = await admin.from('bookings').delete().eq('id', bookingId).select('id')
  if (error) throw new Error(`Could not delete the booking: ${error.message}`)
  if (!data || data.length === 0) throw new Error('That booking no longer exists.')

  revalidatePath('/admin/bookings')
  revalidatePath('/admin')
}
