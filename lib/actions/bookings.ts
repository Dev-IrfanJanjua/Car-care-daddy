'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateQuote } from '@/lib/pricing/calculate-quote'
import { sendBookingConfirmationEmail } from '@/lib/email/send-booking-confirmation'
import type { Database } from '@/lib/types/database.types'

type VehicleClass = Database['public']['Enums']['vehicle_class']

export async function createBooking(formData: FormData) {
  const quoteId = String(formData.get('quoteId') || '') || null
  const make = String(formData.get('make'))
  const model = String(formData.get('model'))
  const year = Number(formData.get('year'))
  const vehicleClass = String(formData.get('class')) as VehicleClass
  const serviceIds = String(formData.get('services')).split(',').filter(Boolean)

  const customerName = String(formData.get('customerName'))
  const customerEmail = String(formData.get('customerEmail'))
  const customerPhone = String(formData.get('customerPhone'))
  const serviceAddress = String(formData.get('serviceAddress'))
  const serviceCity = String(formData.get('serviceCity'))
  const serviceZip = String(formData.get('serviceZip'))
  const scheduledAt = String(formData.get('scheduledAt'))

  // Re-verified server-side -- never trust the client-submitted total.
  const quote = await calculateQuote(vehicleClass, serviceIds)

  if (quote.lineItems.length === 0) {
    throw new Error('No valid services selected')
  }

  const admin = createAdminClient()

  const { data: booking, error: bookingError } = await admin
    .from('bookings')
    .insert({
      quote_id: quoteId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      vehicle_make: make,
      vehicle_model: model,
      vehicle_year: year,
      vehicle_class: vehicleClass,
      service_address: serviceAddress,
      service_city: serviceCity,
      service_zip: serviceZip,
      scheduled_at: new Date(scheduledAt).toISOString(),
      total_amount: quote.total,
    })
    .select('id')
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

  if (quoteId) {
    await admin.from('quotes').update({ status: 'booked' }).eq('id', quoteId)
  }

  await sendBookingConfirmationEmail({
    customerEmail,
    customerName,
    scheduledAt: new Date(scheduledAt).toISOString(),
    serviceAddress,
    serviceCity,
    totalAmount: quote.total,
  })

  redirect(`/book/success/${booking.id}`)
}
