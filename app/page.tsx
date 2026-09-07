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
  const [{ data: reviews }, { services: allServices }] = await Promise.all([
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
  // coming_soon is left out: these cards send people into the quote flow, and
  // an unreleased service has nothing to quote.
  const services = allServices.filter((s) => !s.coming_soon).slice(0, 6)

  // No "from" price is computed any more: prices vary by vehicle class, and the
  // cheapest tier shown as a headline figure under-quotes everyone driving
  // something larger. The cards send people into the quote flow instead, which
  // asks for the car before it shows a number.
  const homeServices: HomeService[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    category: s.category,
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
