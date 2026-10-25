import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getBusinessContact } from '@/lib/business-contact'
import { SiteHeader, SiteFooter } from '@/features/site-shell'
import { BookingCtaSection } from '@/features/home'
import { AboutPage } from '@/features/marketing'

export const metadata: Metadata = {
  title: 'About',
  description: "Who we are and how Car Aurum's doorstep glass restoration works.",
}

export default async function About() {
  const supabase = await createClient()
  const [contact, { data: reviews }] = await Promise.all([
    getBusinessContact(),
    supabase.from('reviews').select('rating').eq('is_public', true).limit(50),
  ])
  const rated = (reviews ?? []).map((r) => r.rating)
  const rating = rated.length >= 3 ? rated.reduce((a, b) => a + b, 0) / rated.length : null

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <AboutPage rating={rating} />
        <BookingCtaSection
          eyebrow="Free doorstep service across Lahore"
          title="Let's bring your glass back to life"
          text="Get your exact price in under a minute, then book a slot that suits you."
          whatsappUrl={contact.whatsappUrl}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
