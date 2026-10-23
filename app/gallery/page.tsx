import type { Metadata } from 'next'
import { getBusinessContact } from '@/lib/business-contact'
import { SiteHeader } from '@/components/home/site-header'
import { SiteFooter } from '@/components/home/site-footer'
import { ComingSoonSection } from '@/components/home/coming-soon-section'

export const metadata: Metadata = {
  title: 'Gallery · Car Care Daddy',
  description: 'Before-and-after photos of our doorstep glass restoration work in Lahore.',
}

export default async function GalleryPage() {
  const contact = await getBusinessContact()

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <ComingSoonSection
          eyebrow="Our work"
          title="Before-and-after gallery"
          description="We're putting together real photos from real doorstep visits across Lahore. Check back soon -- or see the difference for yourself."
          whatsappUrl={contact.whatsappUrl}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
