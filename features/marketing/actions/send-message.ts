'use server'

import { notifyAdminOfNewLead } from '@/lib/notifications/new-lead-alert'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, RateLimitError } from '@/lib/security/rate-limit'
import { text, email, ValidationError } from '@/lib/security/validate'
import { normalizePhone, isValidPhone } from '@/lib/phone'

export type MessageState = {
  ok: boolean
  error?: string
  /** echoed back so the thank-you screen can offer a pre-filled WhatsApp follow-up */
  sent?: { name: string; service: string; message: string }
}

/**
 * Contact-page form. Files the message as a lead (source "contact_form") so it
 * shows up in Admin → Leads. Same guards as every public form: honeypot, length
 * and format checks, and a per-visitor rate limit.
 */
export async function sendContactMessage(_prev: MessageState, formData: FormData): Promise<MessageState> {
  // Honeypot: pretend success so bots learn nothing.
  if (String(formData.get('company') || '').trim()) return { ok: true }

  try {
    const fullName = text(formData, 'fullName', { label: 'Name', max: 80, required: true })
    const phone = normalizePhone(text(formData, 'phone', { label: 'Phone', max: 30, required: true }))
    if (!isValidPhone(phone)) throw new ValidationError('Enter a valid phone number.')
    const rawEmail = text(formData, 'email', { label: 'Email', max: 120 })
    const emailValue = rawEmail ? email(rawEmail) : ''
    const service = text(formData, 'service', { label: 'Service', max: 80 })
    const message = text(formData, 'message', { label: 'Message', max: 1000, min: 5, required: true })

    await rateLimit('contact', { max: 5, windowSeconds: 3600 })

    const admin = createAdminClient()
    const { error } = await admin.from('leads').insert({
      full_name: fullName,
      email: emailValue || null,
      phone,
      message: service ? `[${service}] ${message}` : message,
      source: 'contact_form',
    })
    if (error) throw error

    // Best-effort: the message is already saved, so a failed alert is only logged.
    await notifyAdminOfNewLead({ name: fullName, phone, email: emailValue, service, message }).catch((e) => console.error('lead alert failed', e))

    return { ok: true, sent: { name: fullName, service, message } }
  } catch (e) {
    if (e instanceof RateLimitError) return { ok: false, error: 'Too many messages. Please try again later or use WhatsApp.' }
    if (e instanceof ValidationError) return { ok: false, error: e.message }
    console.error('sendContactMessage failed', e)
    return { ok: false, error: 'Something went wrong. Please message us on WhatsApp instead.' }
  }
}
