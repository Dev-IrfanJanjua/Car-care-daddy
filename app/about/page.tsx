import type { Metadata } from 'next'
import { getBusinessContact } from '@/lib/business-contact'
import { SiteHeader } from '@/components/home/site-header'
import { SiteFooter } from '@/components/home/site-footer'
import { ComingSoonSection } from '@/components/home/coming-soon-section'

export const metadata: Metadata = {
  title: 'About · Car Care Daddy',
  description: "Who we are and how Car Care Daddy's doorstep glass restoration works.",
}

export default async function AboutPage() {
  const contact = await getBusinessContact()

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <ComingSoonSection
          eyebrow="Our story"
          title="About Car Care Daddy"
          description="The story behind Lahore's doorstep glass specialists is on its way. In the meantime, here's how to reach us."
          whatsappUrl={contact.whatsappUrl}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
