'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

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

// createQuoteAndContinue used to live here: it wrote the quotes row and
// uploaded photos, then handed off to /book with a quoteId. Both are now
// inline in lib/actions/bookings.ts's createBooking -- the standalone "review
// your quote" screen between services and booking is gone, so there is no
// longer a step in between to do that work in.
//
// captureQuoteLead and its "Email me this quote instead" form used to live
// here too. Both are gone with the rest of the customer email: the quote page
// leads straight to booking, and the order is confirmed over WhatsApp.
