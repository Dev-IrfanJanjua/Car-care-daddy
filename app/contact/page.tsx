import type { Metadata } from 'next'
import { getBusinessContact } from '@/lib/business-contact'
import { getServiceCatalog } from '@/lib/pricing/service-catalog'
import { SiteHeader, SiteFooter } from '@/features/site-shell'
import { ContactPage } from '@/features/marketing'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Call, WhatsApp or email Car Aurum, or send us a message.',
}

export default async function Contact() {
  const [contact, { services }] = await Promise.all([getBusinessContact(), getServiceCatalog()])
  const names = services.filter((s) => !s.coming_soon).map((s) => s.name)

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <ContactPage contact={contact} services={names} />
      </main>
      <SiteFooter />
    </div>
  )
}
