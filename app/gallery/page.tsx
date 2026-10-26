import type { Metadata } from 'next'
import Link from 'next/link'
import { getBusinessContact } from '@/lib/business-contact'
import { SiteHeader, SiteFooter } from '@/features/site-shell'
import { SectionShell } from '@/features/home'
import { siteButton } from '@/components/ui/site-button'
import { PageHero } from '@/features/marketing'
import { getGallery, GalleryGrid } from '@/features/gallery'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Before-and-after photos of our doorstep glass restoration work in Lahore.',
}

export default async function GalleryPage() {
  const [contact, published] = await Promise.all([getBusinessContact(), getGallery()])
  // Until the first pair is uploaded (Admin → Gallery) show the same built-in pair as the home page.
  const items = published.length
    ? published
    : [
        {
          id: 'default',
          title: 'Windshield restoration',
          service: 'Windshield',
          kind: 'compare' as const,
          mediaUrl: null,
          posterUrl: null,
          beforeUrl: '/images/before-windshield.jpg',
          afterUrl: '/images/after-windshield.jpg',
          isPublished: true,
          isFeatured: false,
        },
      ]

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHero
          image="/images/service-windshield.jpg"
          crumb="Gallery"
          eyebrow="Our work"
          title="Real cars."
          accent="Real results."
          description="Real jobs from real doorsteps across Lahore. Drag each slider to compare before and after."
        />
        {items.length > 0 ? (
          <GalleryGrid items={items} />
        ) : (
          <SectionShell>
            <div className="mx-auto max-w-xl text-center">
              <h2 className="mb-3 font-display text-2xl font-semibold text-chrome-100">New photos coming soon</h2>
              <p className="mb-6 text-chrome-400">
                We&apos;re putting together real photos from real doorstep visits across Lahore. See the difference for yourself.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/quote" className={siteButton()}>
                  Get your price
                </Link>
                <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className={siteButton({ variant: 'ghost' })}>
                  WhatsApp us
                </a>
              </div>
            </div>
          </SectionShell>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
