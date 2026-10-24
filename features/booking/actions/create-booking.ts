'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateQuote } from '@/lib/pricing/calculate-quote'
import { notifyAdminOfNewBooking } from '@/lib/notifications/new-booking-alert'
import { normalizePhone, isValidPhone } from '@/lib/phone'
import { SERVICE_CITY } from '@/lib/contact'
import { rateLimit } from '@/lib/security/rate-limit'
import { text, email, integerInRange, isUuid, pickImages } from '@/lib/security/validate'
import { VEHICLE_CLASSES } from '@/lib/vehicles/classes'
import type { Database } from '@/lib/types/database.types'

type VehicleClass = Database['public']['Enums']['vehicle_class']

export async function createBooking(formData: FormData) {
  // Honeypot: real visitors never see or fill this field. Bots do. Pretend it
  // worked so the bot learns nothing, but write nothing.
  if (String(formData.get('company') || '').trim()) redirect('/quote')

  const make = text(formData, 'make', { label: 'Vehicle make', max: 60, required: true })
  const model = text(formData, 'model', { label: 'Vehicle model', max: 60, required: true })
  const year = integerInRange(formData.get('year'), 'Vehicle year', 1980, new Date().getFullYear() + 1)
  const vehicleClass = String(formData.get('class')) as VehicleClass
  if (!(VEHICLE_CLASSES as readonly string[]).includes(vehicleClass)) throw new Error('Vehicle size is not valid.')

  const serviceIds = String(formData.get('services')).split(',').filter(Boolean)
  if (serviceIds.length === 0 || serviceIds.length > 12 || !serviceIds.every(isUuid)) {
    throw new Error('No valid services selected')
  }

  const customerName = text(formData, 'customerName', { label: 'Name', max: 80, min: 2, required: true })
  const customerEmail = email(text(formData, 'customerEmail', { label: 'Email', max: 120, required: true }))
  const serviceAddress = text(formData, 'serviceAddress', { label: 'Address', max: 250, min: 6, required: true })

  // Fixed, not taken from the form: the shop serves one city, and the field is
  // read-only for that reason -- but a form action accepts any POST, so the
  // posted value is ignored rather than trusted. Widen this when a second city
  // opens, in step with the picker.
  const serviceCity = SERVICE_CITY

  // Re-normalised and re-checked here: the form does the same as you type, but
  // a form action accepts any POST, so the client rule is a convenience and
  // this is the guarantee.
  const customerPhone = normalizePhone(String(formData.get('customerPhone') || ''))
  if (!isValidPhone(customerPhone)) {
    throw new Error('Enter an 11-digit phone number, for example 03001234567.')
  }

  // Already a UTC ISO instant: the form converts the customer's calendar/time
  // selection in the browser, so it carries their own timezone rather than
  // the server's.
  const scheduledAt = String(formData.get('scheduledAt'))
  const when = new Date(scheduledAt)
  if (!scheduledAt || Number.isNaN(when.getTime())) {
    throw new Error('Please pick a valid appointment date and time.')
  }
  if (when.getTime() <= Date.now()) {
    throw new Error('Please pick an appointment time in the future.')
  }
  if (when.getTime() > Date.now() + 120 * 24 * 3600 * 1000) {
    throw new Error('Please pick a date within the next four months.')
  }

  // Spam guard: 6 bookings per hour per connection, 3 per day per phone number.
  await rateLimit('booking', { max: 6, windowSeconds: 3600, extra: customerPhone, extraMax: 3 })

  // Re-verified server-side -- never trust the client-submitted total.
  const quote = await calculateQuote(vehicleClass, serviceIds)

  if (quote.lineItems.length === 0) {
    throw new Error('No valid services selected')
  }

  const admin = createAdminClient()

  // A standalone "review your quote" step used to create this row and upload
  // photos before handing off to booking; that step is gone (prices are
  // already visible on the services list, so it was a screen that only
  // repeated them), so both happen here, right before the booking that
  // references this quote's id.
  const { data: quoteRow, error: quoteError } = await admin
    .from('quotes')
    .insert({
      vehicle_make: make,
      vehicle_model: model,
      vehicle_year: year,
      vehicle_class: vehicleClass,
      line_items: quote.lineItems,
      subtotal: quote.subtotal,
      discount: quote.discount,
      total: quote.total,
    })
    .select('id')
    .single()

  if (quoteError) throw quoteError

  // Best-effort: a failed photo upload should never block the booking. Only
  // small JPG/PNG/WebP images are accepted; the type is verified and the file
  // name is replaced, so nothing the visitor typed reaches the storage path.
  const photos = pickImages(formData.getAll('photos'), { maxFiles: 4, maxBytes: 6 * 1024 * 1024 })
  for (const { file, ext } of photos) {
    const path = `${quoteRow.id}/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await admin.storage
      .from('quote-photos')
      .upload(path, file, { contentType: file.type })
    if (uploadError) continue

    await admin.from('photos').insert({ quote_id: quoteRow.id, storage_path: path })
  }

  // Single transaction: booking + line items + quote status. These used to be
  // three separate writes, so a mid-sequence failure could leave a booking with
  // no services attached.
  const { data, error } = await admin.rpc('create_booking_with_services', {
    p_quote_id: quoteRow.id,
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
