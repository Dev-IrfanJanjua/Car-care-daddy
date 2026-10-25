import type { Metadata } from 'next'
import { getBusinessContact } from '@/lib/business-contact'
import { getServiceCatalog } from '@/lib/pricing/service-catalog'
import { SiteHeader, SiteFooter } from '@/features/site-shell'
import { BookingCtaSection, BundlesSection, SectionShell, type HomeBundle } from '@/features/home'
import { PageHero, ServicesList, PricingTable, type ServiceRow } from '@/features/marketing'
import { getHomeContent, FaqSection } from '@/features/content'
import { PriceFinder, getPriceFinderData } from '@/features/price-finder'

export const metadata: Metadata = {
  title: 'Services & pricing',
  description:
    'Windshield restoration, full glass polishing and headlight restoration at your doorstep in Lahore. Clear prices by vehicle size, 3-year results warranty.',
}

export default async function Services() {
  const [{ services, prices }, content, contact, finder] = await Promise.all([
    getServiceCatalog(),
    getHomeContent(),
    getBusinessContact(),
    getPriceFinderData(),
  ])

  const rows: ServiceRow[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    category: s.category,
    comingSoon: s.coming_soon,
    isPackage: s.is_package,
    prices: Object.fromEntries(prices.filter((p) => p.service_id === s.id).map((p) => [p.vehicle_class, p.base_price])),
  }))
  const singles = rows.filter((r) => !r.isPackage)
  const bundles: HomeBundle[] = rows
    .filter((r) => r.isPackage && !r.comingSoon)
    .map((r) => {
      const amounts = Object.values(r.prices).filter((n): n is number => typeof n === 'number')
      return { id: r.id, name: r.name, description: r.description, fromPrice: amounts.length ? Math.min(...amounts) : null }
    })

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHero
          image="/images/service-glass-polish.jpg"
          crumb="Services"
          eyebrow="Our services"
          title="Every service,"
          accent="done at your door"
          description="Restoration, not replacement. Pick what your car needs — we bring the equipment to your home or office anywhere in Lahore."
          whatsappUrl={contact.whatsappUrl}
        />
        <ServicesList services={singles} whatsappBase={contact.whatsappUrl} />
        <BundlesSection bundles={bundles} />
        <PricingTable services={rows} />
        <SectionShell flush>
          <PriceFinder data={finder} />
        </SectionShell>
        <FaqSection faqs={content.faqs} />
        <BookingCtaSection
          eyebrow="Not sure what you need?"
          title="Send us a photo on WhatsApp"
          text="Tell us what's bothering you about your glass or lights and we'll recommend the right fix and a price — no obligation."
          whatsappUrl={contact.whatsappUrl}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
