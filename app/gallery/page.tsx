import type { Metadata } from 'next'
import { getBusinessContact } from '@/lib/business-contact'
import { SiteHeader, SiteFooter } from '@/features/site-shell'
import { ComingSoonSection } from '@/features/home'
import { getGallery, GalleryGrid } from '@/features/gallery'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Before-and-after photos of our doorstep glass restoration work in Lahore.',
}

export default async function GalleryPage() {
  const [contact, items] = await Promise.all([getBusinessContact(), getGallery()])

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        {items.length > 0 ? (
          <GalleryGrid items={items} />
        ) : (
          <ComingSoonSection
            eyebrow="Our work"
            title="Before-and-after gallery"
            description="We're putting together real photos from real doorstep visits across Lahore. Check back soon -- or see the difference for yourself."
            whatsappUrl={contact.whatsappUrl}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
