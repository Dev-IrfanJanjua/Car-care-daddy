import type { Metadata } from 'next'
import { Mail, MapPin, Phone } from 'lucide-react'
import { getBusinessContact } from '@/lib/business-contact'
import { SiteHeader } from '@/components/home/site-header'
import { SiteFooter } from '@/components/home/site-footer'
import { ComingSoonSection } from '@/components/home/coming-soon-section'

export const metadata: Metadata = {
  title: 'Contact · Car Care Daddy',
  description: 'Call, WhatsApp or email Car Care Daddy, or get an instant price for your car.',
}

// A dedicated contact form is coming later, but "how do I reach you" is this
// page's entire job -- so unlike the other three placeholders, this one
// surfaces the real phone, WhatsApp and email up front rather than making
// that wait too.
export default async function ContactPage() {
  const contact = await getBusinessContact()

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <ComingSoonSection
          eyebrow="Get in touch"
          title="Contact Car Care Daddy"
          description="A dedicated contact form is on its way. Right now, the fastest way to reach us is WhatsApp or a call."
          whatsappUrl={contact.whatsappUrl}
        >
          <dl className="mt-8 flex w-full max-w-sm flex-col gap-3 text-left text-sm">
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-3">
              <Phone className="size-4 shrink-0 text-gold" />
              <dt className="sr-only">Phone</dt>
              <dd>
                <a href={`tel:+${contact.whatsappNumber}`} className="hover:text-gold-ink">
                  {contact.whatsappDisplay}
                </a>
              </dd>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-3">
              <Mail className="size-4 shrink-0 text-gold" />
              <dt className="sr-only">Email</dt>
              <dd>
                <a href={`mailto:${contact.email}`} className="hover:text-gold-ink">
                  {contact.email}
                </a>
              </dd>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-3">
              <MapPin className="size-4 shrink-0 text-gold" />
              <dt className="sr-only">Coverage area</dt>
              <dd>Doorstep service across Lahore</dd>
            </div>
          </dl>
        </ComingSoonSection>
      </main>
      <SiteFooter />
    </div>
  )
}
