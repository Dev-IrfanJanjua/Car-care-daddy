import type { Metadata } from 'next'
import { getServiceCatalog } from '@/lib/pricing/service-catalog'
import { SiteHeader, SiteFooter } from '@/features/site-shell'
import { BookingCtaSection } from '@/features/home'
import { ServicesPage, type ServiceRow } from '@/features/marketing'
import { getHomeContent } from '@/features/content'

export const metadata: Metadata = {
  title: 'Services & pricing',
  description:
    'Windshield restoration, full glass polishing and headlight restoration at your doorstep in Lahore. Clear prices by vehicle size, 3-year results warranty.',
}

export default async function Services() {
  const [{ services, prices }, content] = await Promise.all([getServiceCatalog(), getHomeContent()])

  const rows: ServiceRow[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    category: s.category,
    comingSoon: s.coming_soon,
    isPackage: s.is_package,
    prices: Object.fromEntries(prices.filter((p) => p.service_id === s.id).map((p) => [p.vehicle_class, p.base_price])),
  }))

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <ServicesPage services={rows} />
        <BookingCtaSection title={content.ctaTitle} text={content.ctaText} />
      </main>
      <SiteFooter />
    </div>
  )
}
