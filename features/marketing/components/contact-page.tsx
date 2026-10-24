import Link from 'next/link'
import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WhatsAppIcon } from '@/components/icons/brand-icons'
import { Reveal } from '@/components/motion/reveal'
import { SERVICE_CITY } from '@/lib/contact'
import type { BusinessContact } from '@/lib/business-contact'
import { PageHero } from './page-hero'

function Card({ icon: Icon, label, children }: { icon: typeof Phone; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card p-5 dk:rounded-md">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground dk:rounded-xs">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{label}</p>
        <div className="mt-1 text-foreground">{children}</div>
      </div>
    </div>
  )
}

export function ContactPage({ contact }: { contact: BusinessContact }) {
  const hours = contact.hours
  const rows: [string, string | undefined][] = [
    ['Mon – Fri', hours?.mon_fri],
    ['Saturday', hours?.sat],
    ['Sunday', hours?.sun],
  ]

  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Talk to Car Aurum"
        description="The fastest way to reach us is WhatsApp. You can also call, email, or get an instant price and book online."
      >
        <div className="mt-7 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Button size="lg" className="h-12 px-6 text-base" render={<a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" />}>
            <WhatsAppIcon className="size-4" />
            Message on WhatsApp
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-6 text-base" render={<Link href="/quote" />}>
            Get your price
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
        </div>
      </PageHero>

      <section className="mx-auto max-w-4xl px-4 pb-14 sm:px-6 sm:pb-20">
        <Reveal className="grid gap-4 sm:grid-cols-2">
          <Card icon={Phone} label="Call or WhatsApp">
            <a href={`tel:+${contact.whatsappNumber}`} className="font-medium hover:text-gold-ink">
              {contact.whatsappDisplay}
            </a>
          </Card>
          <Card icon={Mail} label="Email">
            <a href={`mailto:${contact.email}`} className="font-medium break-all hover:text-gold-ink">
              {contact.email}
            </a>
          </Card>
          <Card icon={MapPin} label="Where we work">
            <p className="font-medium">Doorstep service across {SERVICE_CITY}</p>
            <p className="text-sm text-muted-foreground">We come to your home or office. The visit is free.</p>
          </Card>
          <Card icon={Clock} label="Hours">
            {hours ? (
              <dl className="space-y-0.5 text-sm">
                {rows.map(([day, value]) => (
                  <div key={day} className="flex justify-between gap-6">
                    <dt className="text-muted-foreground">{day}</dt>
                    <dd className="font-medium">{value || 'Closed'}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">Message us any time — we reply as soon as we can.</p>
            )}
          </Card>
        </Reveal>
      </section>
    </>
  )
}
