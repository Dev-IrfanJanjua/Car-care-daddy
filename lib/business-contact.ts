import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { toWhatsAppDigits } from '@/lib/phone'
import {
  CONTACT_EMAIL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
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
  facebookUrl: string
  instagramUrl: string
}

/**
 * Turns whatever an admin pasted into a profile URL.
 *
 * People copy these from wildly different places -- the address bar, the app's
 * share sheet, a business card -- so "https://instagram.com/carcaredaddy",
 * "instagram.com/carcaredaddy", "@carcaredaddy" and "/carcaredaddy" all have to
 * work. Rejecting three of those four would just teach the shop the field is
 * broken. Returns '' when there is nothing usable, so the caller falls back.
 */
function toProfileUrl(raw: string | null, host: string) {
  const value = (raw ?? '').trim()
  if (!value) return ''

  if (/^https?:\/\//i.test(value)) return value
  if (value.toLowerCase().startsWith(`${host}/`)) return `https://${value}`

  // Whatever is left is a handle: strip the '@' or '/' people prefix it with.
  const handle = value.replace(/^[@/]+/, '').replace(/\/+$/, '')
  return handle ? `https://${host}/${handle}` : ''
}

/**
 * The shop's public contact details and social profiles, editable at
 * /admin/settings.
 *
 * lib/contact.ts is the fallback, not the source: a blank or unparseable
 * setting falls back per field to the compiled-in value rather than rendering a
 * dead link. That matters because every one of these is free text -- an admin
 * can save a typo, and a typo must not take a contact button down.
 *
 * Cached like the catalogs, and lib/actions/admin/settings.ts invalidates the
 * tag on save so an edit is live immediately.
 */
export const getBusinessContact = unstable_cache(
  async (): Promise<BusinessContact> => {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('business_settings')
      .select('contact_phone, contact_email, facebook_url, instagram_url')
      .maybeSingle()

    const digits = toWhatsAppDigits(data?.contact_phone ?? '')
    const email = (data?.contact_email ?? '').trim()

    return {
      whatsappNumber: digits || WHATSAPP_NUMBER,
      whatsappDisplay: digits ? (data?.contact_phone ?? '').trim() : WHATSAPP_DISPLAY,
      whatsappUrl: digits ? `https://wa.me/${digits}` : WHATSAPP_URL,
      email: email || CONTACT_EMAIL,
      facebookUrl: toProfileUrl(data?.facebook_url ?? null, 'facebook.com') || FACEBOOK_URL,
      instagramUrl: toProfileUrl(data?.instagram_url ?? null, 'instagram.com') || INSTAGRAM_URL,
    }
  },
  ['business-contact'],
  { tags: [BUSINESS_CONTACT_TAG], revalidate: 3600 }
)
