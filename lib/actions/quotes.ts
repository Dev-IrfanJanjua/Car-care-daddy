'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateQuote } from '@/lib/pricing/calculate-quote'
import type { Database } from '@/lib/types/database.types'

type VehicleClass = Database['public']['Enums']['vehicle_class']

export async function createQuoteAndContinue(formData: FormData) {
  const make = String(formData.get('make'))
  const model = String(formData.get('model'))
  const year = String(formData.get('year'))
  const vehicleClass = String(formData.get('class')) as VehicleClass
  const services = String(formData.get('services'))
  const serviceIds = services.split(',').filter(Boolean)

  // Re-verified server-side -- the summary page's displayed total is never trusted directly.
  const quote = await calculateQuote(vehicleClass, serviceIds)

  if (quote.lineItems.length === 0) {
    redirect('/quote')
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('quotes')
    .insert({
      vehicle_make: make,
      vehicle_model: model,
      vehicle_year: Number(year),
      vehicle_class: vehicleClass,
      line_items: quote.lineItems,
      subtotal: quote.subtotal,
      discount: quote.discount,
      total: quote.total,
    })
    .select('id')
    .single()

  if (error) throw error

  const photos = formData
    .getAll('photos')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)

  // Best-effort: a failed photo upload should never block the booking flow.
  for (const photo of photos) {
    const path = `${data.id}/${crypto.randomUUID()}-${photo.name}`
    const { error: uploadError } = await admin.storage
      .from('quote-photos')
      .upload(path, photo, { contentType: photo.type })
    if (uploadError) continue

    await admin.from('photos').insert({ quote_id: data.id, storage_path: path })
  }

  const params = new URLSearchParams({
    quoteId: data.id,
    make,
    model,
    year,
    class: vehicleClass,
    services,
    total: String(quote.total),
  })
  redirect(`/book?${params.toString()}`)
}

// The quote wizard requires a make+model from the catalog, so a car that isn't
// listed is otherwise a dead end. This files a lead for manual pricing rather
// than guessing a vehicle class (which would produce a wrong price).
export async function captureUnlistedVehicleLead(formData: FormData) {
  const fullName = String(formData.get('fullName') || '')
  const email = String(formData.get('email') || '')
  const phone = String(formData.get('phone') || '')
  const make = String(formData.get('make') || '')
  const model = String(formData.get('model') || '')
  const yearRaw = formData.get('year')
  const year = yearRaw ? Number(yearRaw) : null

  const admin = createAdminClient()
  const { error } = await admin.from('leads').insert({
    full_name: fullName || null,
    email: email || null,
    phone: phone || null,
    vehicle_make: make || null,
    vehicle_model: model || null,
    vehicle_year: Number.isFinite(year) ? year : null,
    source: 'vehicle_not_listed',
  })
  if (error) throw error

  redirect('/quote/not-listed/thanks')
}

// captureQuoteLead and its "Email me this quote instead" form used to live here.
// Both are gone with the rest of the customer email: the quote page now leads
// straight to booking, and the order is confirmed over WhatsApp.
