'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateQuote } from '@/lib/pricing/calculate-quote'
import { sendBookingConfirmationEmail } from '@/lib/email/send-booking-confirmation'
import type { Database } from '@/lib/types/database.types'

type LeadStatus = Database['public']['Enums']['lead_status']
type VehicleClass = Database['public']['Enums']['vehicle_class']

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase.from('leads').update({ status }).eq('id', leadId)
  if (error) throw error

  revalidatePath('/admin/leads')
  revalidatePath(`/admin/leads/${leadId}`)
}

export async function convertLeadToBooking(leadId: string, formData: FormData) {
  const { supabase } = await requireAdmin()

  const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).single()
  if (!lead) throw new Error('Lead not found')

  const customerName = String(formData.get('customerName') || '')
  const customerEmail = String(formData.get('customerEmail') || '')
  const customerPhone = String(formData.get('customerPhone') || '')
  const serviceAddress = String(formData.get('serviceAddress') || '')
  const serviceCity = String(formData.get('serviceCity') || '')
  const serviceZip = String(formData.get('serviceZip') || '')
  const scheduledAt = String(formData.get('scheduledAt') || '')
  const vehicleClass = String(formData.get('vehicleClass')) as VehicleClass
  const serviceIds = (lead.service_ids ?? []) as string[]

  const quote = await calculateQuote(vehicleClass, serviceIds)
  if (quote.lineItems.length === 0) {
    throw new Error('Lead has no valid services to convert')
  }

  // bookings/booking_services have no INSERT policy -- by design, per 0002's
  // header comment, every booking insert goes through the service-role client.
  // requireAdmin() above is still what authorizes this action.
  const admin = createAdminClient()

  const { data: booking, error: bookingError } = await admin
    .from('bookings')
    .insert({
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      vehicle_make: lead.vehicle_make ?? '',
      vehicle_model: lead.vehicle_model ?? '',
      vehicle_year: lead.vehicle_year ?? 0,
      vehicle_class: vehicleClass,
      service_address: serviceAddress,
      service_city: serviceCity,
      service_zip: serviceZip,
      scheduled_at: new Date(scheduledAt).toISOString(),
      total_amount: quote.total,
    })
    .select('id, access_token')
    .single()

  if (bookingError) throw bookingError

  const { error: servicesError } = await admin.from('booking_services').insert(
    quote.lineItems.map((item) => ({
      booking_id: booking.id,
      service_id: item.serviceId,
      price: item.price,
    }))
  )
  if (servicesError) throw servicesError

  const { error: leadError } = await supabase
    .from('leads')
    .update({ status: 'converted', converted_booking_id: booking.id })
    .eq('id', leadId)
  if (leadError) throw leadError

  // The public booking path emails a confirmation; this one didn't. Same
  // best-effort contract -- a failed send never blocks the conversion.
  await sendBookingConfirmationEmail({
    bookingId: booking.id,
    accessToken: booking.access_token,
    customerEmail,
    customerName,
    scheduledAt: new Date(scheduledAt).toISOString(),
    serviceAddress,
    serviceCity,
    totalAmount: quote.total,
  })

  redirect(`/admin/bookings/${booking.id}`)
}
