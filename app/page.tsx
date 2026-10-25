import { createClient } from '@/lib/supabase/server'
import { getServiceCatalog } from '@/lib/pricing/service-catalog'
import { getBusinessContact } from '@/lib/business-contact'
import { SiteHeader, SiteFooter } from '@/features/site-shell'
import {
  Hero,
  StripSection,
  ServicesSection,
  BundlesSection,
  WhyChooseUsSection,
  HowItWorksSection,
  BeforeAfterSection,
  TestimonialsSection,
  BookingCtaSection,
  type HomeService,
  type HomeBundle,
} from '@/features/home'
import { getBrandSettings } from '@/features/brand'
import { getHomeContent, FaqSection } from '@/features/content'
import { getGallery, pickCarouselItems } from '@/features/gallery'
import { localBusinessJsonLd } from '@/lib/seo'
import { PriceFinder, getPriceFinderData } from '@/features/price-finder'

export default async function Home() {
  const supabase = await createClient()

  // Services and prices come from the cached catalog; only the reviews are
  // fetched per request. That takes the homepage from three round trips to a
  // database in Tokyo down to one.
  const [{ data: reviews }, { services: allServices, prices }, contact, finder, brand, content, gallery] = await Promise.all([
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
  // can't drift from what customers can actually book. coming_soon is left
  // out: these cards send people into the quote flow, and an unreleased
  // service has nothing to quote. Packages get their own "Bundles" section.
  const fromPrice = (serviceId: string) => {
    const amounts = prices.filter((p) => p.service_id === serviceId).map((p) => p.base_price)
    return amounts.length ? Math.min(...amounts) : null
  }
  const bookable = allServices.filter((s) => !s.coming_soon)
  // Services on hold are shown (greyed, "Coming soon", no price) after the
  // bookable ones, so visitors can see what's on the way.
  const homeServices: HomeService[] = [...bookable.filter((s) => !s.is_package), ...allServices.filter((s) => s.coming_soon && !s.is_package)]
    .slice(0, 6)
    .map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      fromPrice: s.coming_soon ? null : fromPrice(s.id),
      comingSoon: s.coming_soon,
    }))
  const homeBundles: HomeBundle[] = bookable
    .filter((s) => s.is_package)
    .slice(0, 3)
    .map((s) => ({ id: s.id, name: s.name, description: s.description, fromPrice: fromPrice(s.id) }))

  // Customer rating shown in the stats strip: the live average of the public
  // reviews, once there are at least three of them.
  const rated = (reviews ?? []).map((r) => r.rating)
  const rating = rated.length >= 3 ? rated.reduce((a, b) => a + b, 0) / rated.length : null

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
          startingLabel={headlineService?.name}
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
        <StripSection />
        {homeServices.length > 0 && <ServicesSection services={homeServices} />}
        <BundlesSection bundles={homeBundles} />
        <BeforeAfterSection items={pickCarouselItems(gallery)} />
        <HowItWorksSection />
        <WhyChooseUsSection rating={rating} />
        <TestimonialsSection reviews={reviews ?? undefined} />
        <FaqSection faqs={content.faqs} />
        <BookingCtaSection title={content.ctaTitle} text={content.ctaText} whatsappUrl={contact.whatsappUrl} />
      </main>

      <SiteFooter />
    </div>
  )
}
