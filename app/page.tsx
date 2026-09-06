import { createClient } from '@/lib/supabase/server'
import { getServiceCatalog } from '@/lib/pricing/service-catalog'
import { SiteHeader } from '@/components/home/site-header'
import { HeroSection } from '@/components/home/hero-section'
import { ServicesSection, type HomeService } from '@/components/home/services-section'
import { BeforeAfterSection } from '@/components/home/before-after-section'
import { HowItWorksSection } from '@/components/home/how-it-works-section'
import { WhyChooseUsSection } from '@/components/home/why-choose-us-section'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { BookingCtaSection } from '@/components/home/booking-cta-section'
import { MobileTabBar } from '@/components/home/mobile-tab-bar'

export default async function Home() {
  const supabase = await createClient()

  // Services and prices come from the cached catalog; only the reviews are
  // fetched per request. That takes the homepage from three round trips to a
  // database in Tokyo down to one.
  const [{ data: reviews }, { services: allServices, prices }] = await Promise.all([
    supabase
      .from('reviews')
      .select('rating, comment')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(6),
    getServiceCatalog(),
  ])

  // Driven from the catalog rather than a hardcoded list, so the homepage
  // can't drift from what customers can actually book.
  const services = allServices.slice(0, 6)

  // "From" price = the cheapest class for that service (sedan/coupe in practice).
  const cheapest = new Map<string, number>()
  for (const p of prices) {
    const price = Number(p.base_price)
    const current = cheapest.get(p.service_id)
    if (current === undefined || price < current) cheapest.set(p.service_id, price)
  }

  const homeServices: HomeService[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    category: s.category,
    fromPrice: cheapest.get(s.id) ?? null,
  }))

  return (
    <div className="flex flex-1 flex-col">
      {/* The homepage is the only route with a dark full-bleed hero, so it's
          the only one that floats the header over the top of it. */}
      <SiteHeader overlay />

      <main className="flex-1">
        <HeroSection />
        {homeServices.length > 0 && <ServicesSection services={homeServices} />}
        <BeforeAfterSection />
        <HowItWorksSection />
        <WhyChooseUsSection />
        <TestimonialsSection reviews={reviews ?? undefined} />
        <BookingCtaSection />
      </main>

      <MobileTabBar />
    </div>
  )
}
