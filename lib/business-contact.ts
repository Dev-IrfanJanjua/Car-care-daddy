import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { toWhatsAppDigits } from '@/lib/phone'
import {
  CONTACT_EMAIL,
  WHATSAPP_DISPLAY,
  WHATSAPP_NUMBER,
  WHATSAPP_URL,
} from '@/lib/contact'

export const BUSINESS_CONTACT_TAG = 'business-contact'

export type BusinessContact = {
  /** wa.me digits: international, no '+', no leading zero. */
  whatsappNumber: string
  /** Human-readable, as typed in settings. */
  whatsappDisplay: string
  whatsappUrl: string
  email: string
}

/**
 * The shop's public contact details, editable at /admin/settings.
 *
 * lib/contact.ts is the fallback, not the source: a blank or unparseable
 * setting falls back to the compiled-in value rather than rendering a dead
 * wa.me link or an empty mailto. That matters because contact_phone is a
 * free-text field -- an admin can save a typo, and a typo must not take the
 * WhatsApp button down.
 *
 * Cached like the catalogs, and lib/actions/admin/settings.ts invalidates the
 * tag on save so an edit is live immediately.
 */
export const getBusinessContact = unstable_cache(
  async (): Promise<BusinessContact> => {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('business_settings')
      .select('contact_phone, contact_email')
      .maybeSingle()

    const digits = toWhatsAppDigits(data?.contact_phone ?? '')
    const email = (data?.contact_email ?? '').trim()

    return {
      whatsappNumber: digits || WHATSAPP_NUMBER,
      whatsappDisplay: digits ? (data?.contact_phone ?? '').trim() : WHATSAPP_DISPLAY,
      whatsappUrl: digits ? `https://wa.me/${digits}` : WHATSAPP_URL,
      email: email || CONTACT_EMAIL,
    }
  },
  ['business-contact'],
  { tags: [BUSINESS_CONTACT_TAG], revalidate: 3600 }
)
