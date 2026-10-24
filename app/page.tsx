import { createClient } from '@/lib/supabase/server'
import { getServiceCatalog } from '@/lib/pricing/service-catalog'
import { getBusinessContact } from '@/lib/business-contact'
import { SiteHeader, SiteFooter } from '@/features/site-shell'
import {
  Hero,
  IntroVideoSection,
  ServicesSection,
  WhyChooseUsSection,
  HowItWorksSection,
  BeforeAfterSection,
  TestimonialsSection,
  BookingCtaSection,
  type HomeService,
} from '@/features/home'
import { getBrandSettings } from '@/features/brand'
import { getHomeContent, FaqSection } from '@/features/content'
import { getGallery, pickFeatured } from '@/features/gallery'
import { localBusinessJsonLd } from '@/lib/seo'
import { PriceFinder, getPriceFinderData } from '@/features/price-finder'

export default async function Home() {
  const supabase = await createClient()

  // Services and prices come from the cached catalog; only the reviews are
  // fetched per request. That takes the homepage from three round trips to a
  // database in Tokyo down to one.
  const [{ data: reviews }, { services: allServices }, contact, finder, brand, content, gallery] = await Promise.all([
    supabase
      .from('reviews')
      .select('rating, comment')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(6),
    getServiceCatalog(),
    // The hero's Call button needs a tel: link. HeroSection is a client
    // component (entrance motion), and this is a server-only cached read, so
    // it's fetched here and passed down rather than read inside the hero.
    getBusinessContact(),
    getPriceFinderData(),
    getBrandSettings(),
    getHomeContent(),
    getGallery(),
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

  // The hero's floating chip quotes the first bookable service's lowest tier.
  const headlineService = finder.services[0]
  const headlinePrice = headlineService ? Math.min(...Object.values(headlineService.prices)) : null

  return (
    <div className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd(contact)).replace(/</g, '\\u003c') }}
      />
      <SiteHeader />

      <main id="main" className="flex-1">
        <Hero
          whatsappUrl={contact.whatsappUrl}
          startingPrice={headlinePrice}
          content={content}
          media={{
            type: brand.heroMediaType,
            videoUrl: brand.heroVideoUrl,
            imageUrl: brand.heroImageUrl,
            posterUrl: brand.heroPosterUrl,
          }}
        >
          <PriceFinder data={finder} />
        </Hero>
        <IntroVideoSection />
        <WhyChooseUsSection />
        {homeServices.length > 0 && <ServicesSection services={homeServices} />}
        <BeforeAfterSection pair={pickFeatured(gallery)} />
        <HowItWorksSection />
        <TestimonialsSection reviews={reviews ?? undefined} />
        <FaqSection faqs={content.faqs} />
        <BookingCtaSection title={content.ctaTitle} text={content.ctaText} />
      </main>

      <SiteFooter />
    </div>
  )
}
