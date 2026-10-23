import type { Metadata } from 'next'
import { getBusinessContact } from '@/lib/business-contact'
import { SiteHeader } from '@/components/home/site-header'
import { SiteFooter } from '@/components/home/site-footer'
import { ComingSoonSection } from '@/components/home/coming-soon-section'

export const metadata: Metadata = {
  title: 'Services · Car Care Daddy',
  description:
    'Windshield restoration, full glass polishing and headlight restoration -- doorstep car care in Lahore.',
}

// Full per-service detail is being designed separately; this stands in so the
// header's Services link goes somewhere real rather than a 404 in the
// meantime.
export default async function ServicesPage() {
  const contact = await getBusinessContact()

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <ComingSoonSection
          eyebrow="What we do"
          title="Every service, in one place"
          description="We're building a full breakdown of each service and what it costs by vehicle class. For now, get your exact price in under a minute."
          whatsappUrl={contact.whatsappUrl}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
