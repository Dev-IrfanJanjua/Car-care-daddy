import type { Metadata } from 'next'
import { getBusinessContact } from '@/lib/business-contact'
import { SiteHeader, SiteFooter } from '@/features/site-shell'
import { BookingCtaSection, HowItWorksSection } from '@/features/home'
import { AboutPage } from '@/features/marketing'

export const metadata: Metadata = {
  title: 'About',
  description: "Who we are and how Car Aurum's doorstep glass restoration works.",
}

export default async function About() {
  const contact = await getBusinessContact()

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <AboutPage whatsappUrl={contact.whatsappUrl} />
        <HowItWorksSection />
        <BookingCtaSection />
      </main>
      <SiteFooter />
    </div>
  )
}
