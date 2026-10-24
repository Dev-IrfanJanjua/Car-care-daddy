'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/security/rate-limit'
import { text, email, integerInRange } from '@/lib/security/validate'
import { normalizePhone, isValidPhone } from '@/lib/phone'

// The quote wizard requires a make+model from the catalog, so a car that isn't
// listed is otherwise a dead end. This files a lead for manual pricing rather
// than guessing a vehicle class (which would produce a wrong price).
export async function captureUnlistedVehicleLead(formData: FormData) {
  // Honeypot (see createBooking).
  if (String(formData.get('company') || '').trim()) redirect('/quote/not-listed/thanks')

  const fullName = text(formData, 'fullName', { label: 'Name', max: 80 })
  const rawEmail = text(formData, 'email', { label: 'Email', max: 120 })
  const emailValue = rawEmail ? email(rawEmail) : ''
  const phone = normalizePhone(text(formData, 'phone', { label: 'Phone', max: 30 }))
  const make = text(formData, 'make', { label: 'Vehicle make', max: 60 })
  const model = text(formData, 'model', { label: 'Vehicle model', max: 60 })
  const yearRaw = formData.get('year')
  const year = yearRaw ? integerInRange(yearRaw, 'Vehicle year', 1980, new Date().getFullYear() + 1) : null

  // A lead nobody can answer is just noise.
  if (!emailValue && !isValidPhone(phone)) throw new Error('Add a phone number or email so we can get back to you.')

  await rateLimit('lead', { max: 5, windowSeconds: 3600 })

  const admin = createAdminClient()
  const { error } = await admin.from('leads').insert({
    full_name: fullName || null,
    email: emailValue || null,
    phone: isValidPhone(phone) ? phone : null,
    vehicle_make: make || null,
    vehicle_model: model || null,
    vehicle_year: year,
    source: 'vehicle_not_listed',
  })
  if (error) throw error

  redirect('/quote/not-listed/thanks')
}

// createQuoteAndContinue used to live here: it wrote the quotes row and
// uploaded photos, then handed off to /book with a quoteId. Both are now
// inline in features/booking/actions/create-booking.ts's createBooking -- the standalone "review
// your quote" screen between services and booking is gone, so there is no
// longer a step in between to do that work in.
//
// captureQuoteLead and its "Email me this quote instead" form used to live
// here too. Both are gone with the rest of the customer email: the quote page
// leads straight to booking, and the order is confirmed over WhatsApp.
