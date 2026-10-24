import type { Metadata } from 'next'
import { getBusinessContact } from '@/lib/business-contact'
import { SiteHeader, SiteFooter } from '@/features/site-shell'
import { ContactPage } from '@/features/marketing'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Call, WhatsApp or email Car Aurum, or get an instant price for your car.',
}

export default async function Contact() {
  const contact = await getBusinessContact()

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <ContactPage contact={contact} />
      </main>
      <SiteFooter />
    </div>
  )
}
