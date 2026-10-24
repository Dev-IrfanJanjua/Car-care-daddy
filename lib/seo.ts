import { siteUrl } from '@/lib/site-url'
import { SERVICE_CITY, WARRANTY_YEARS } from '@/lib/contact'

/** schema.org LocalBusiness for the home page: what shows up in Google's business panel. */
export function localBusinessJsonLd(contact: {
  whatsappNumber: string
  email: string
  facebookUrl: string
  instagramUrl: string
}) {
  const base = siteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: 'Car Aurum',
    description: `Doorstep windshield restoration, glass polishing and headlight restoration in ${SERVICE_CITY}. ${WARRANTY_YEARS}-year results warranty.`,
    url: base,
    logo: `${base}/images/logo-light.png`,
    image: `${base}/images/hero-poster.jpg`,
    telephone: `+${contact.whatsappNumber}`,
    email: contact.email,
    areaServed: { '@type': 'City', name: SERVICE_CITY },
    address: { '@type': 'PostalAddress', addressLocality: SERVICE_CITY, addressCountry: 'PK' },
    priceRange: 'Rs',
    sameAs: [contact.facebookUrl, contact.instagramUrl].filter(Boolean),
  }
}
