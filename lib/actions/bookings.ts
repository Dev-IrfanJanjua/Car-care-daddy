'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateQuote } from '@/lib/pricing/calculate-quote'
import { notifyAdminOfNewBooking } from '@/lib/notifications/new-booking-alert'
import { normalizePhone, isValidPhone } from '@/lib/phone'
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
  const serviceAddress = String(formData.get('serviceAddress'))
  const serviceCity = String(formData.get('serviceCity'))

  // Re-normalised and re-checked here: the form does the same as you type, but
  // a form action accepts any POST, so the client rule is a convenience and
  // this is the guarantee.
  const customerPhone = normalizePhone(String(formData.get('customerPhone') || ''))
  if (!isValidPhone(customerPhone)) {
    throw new Error('Enter an 11-digit phone number, for example 03001234567.')
  }

  // Already a UTC ISO instant: the form converts the datetime-local value in
  // the browser, so it carries the customer's timezone rather than the server's.
  const scheduledAt = String(formData.get('scheduledAt'))
  const when = new Date(scheduledAt)
  if (!scheduledAt || Number.isNaN(when.getTime())) {
    throw new Error('Please pick a valid appointment date and time.')
  }
  if (when.getTime() <= Date.now()) {
    throw new Error('Please pick an appointment time in the future.')
  }

  // Re-verified server-side -- never trust the client-submitted total.
  const quote = await calculateQuote(vehicleClass, serviceIds)

  if (quote.lineItems.length === 0) {
    throw new Error('No valid services selected')
  }

  const admin = createAdminClient()

  // Single transaction: booking + line items + quote status. These used to be
  // three separate writes, so a mid-sequence failure could leave a booking with
  // no services attached.
  const { data, error } = await admin.rpc('create_booking_with_services', {
    p_quote_id: quoteId,
    p_customer_name: customerName,
    p_customer_email: customerEmail,
    p_customer_phone: customerPhone,
    p_vehicle_make: make,
    p_vehicle_model: model,
    p_vehicle_year: year,
    p_vehicle_class: vehicleClass,
    p_service_address: serviceAddress,
    p_service_city: serviceCity,
    // Postal codes are no longer collected -- the service area is one city, so
    // the field was pure friction. The column and this RPC arg are NOT NULL, so
    // an empty string stands in rather than forcing a schema migration.
    p_service_zip: '',
    p_scheduled_at: when.toISOString(),
    p_total_amount: quote.total,
    p_line_items: quote.lineItems.map((item) => ({
      service_id: item.serviceId,
      price: item.price,
    })),
  })

  if (error) throw error

  const created = data?.[0]
  if (!created) throw new Error('Booking could not be created')

  // The customer gets no email -- they confirm on the success screen by sending
  // the order to the shop over WhatsApp. This alert is what guarantees the shop
  // still hears about a booking the customer never sends. Deliberately not
  // awaited for its result: it is best-effort and must never cost a booking
  // that is already committed to the database.
  await notifyAdminOfNewBooking({
    bookingId: created.new_booking_id,
    customerName,
    customerEmail,
    customerPhone,
    vehicle: `${year} ${make} ${model} (${vehicleClass})`,
    scheduledAt: when.toISOString(),
    serviceAddress,
    serviceCity,
    lineItems: quote.lineItems,
    totalAmount: quote.total,
  })

  redirect(`/book/success/${created.new_booking_id}?t=${created.new_access_token}`)
}
