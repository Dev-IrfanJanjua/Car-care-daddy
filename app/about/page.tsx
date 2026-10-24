import type { Metadata } from 'next'
import { getBusinessContact } from '@/lib/business-contact'
import { SiteHeader, SiteFooter } from '@/features/site-shell'
import { ComingSoonSection } from '@/features/home'

export const metadata: Metadata = {
  title: 'About',
  description: "Who we are and how Car Aurum's doorstep glass restoration works.",
}

export default async function AboutPage() {
  const contact = await getBusinessContact()

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <ComingSoonSection
          eyebrow="Our story"
          title="About Car Aurum"
          description="The story behind Lahore's doorstep glass specialists is on its way. In the meantime, here's how to reach us."
          whatsappUrl={contact.whatsappUrl}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
