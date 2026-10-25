import type { ReactNode } from 'react'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { WhatsAppIcon } from '@/components/icons/brand-icons'
import { Reveal } from '@/components/motion/reveal'
import { SERVICE_CITY } from '@/lib/contact'
import type { BusinessContact } from '@/lib/business-contact'
import { SectionShell } from '@/features/home'
import { cn } from '@/lib/utils'
import { PageHero } from './page-hero'
import { ContactForm } from './contact-form'

function CCard({
  icon,
  label,
  title,
  href,
  external,
}: {
  icon: ReactNode
  label: string
  title: string
  href?: string
  external?: boolean
}) {
  const cls = cn(
    'mb-3.5 flex items-center gap-[18px] rounded-xl border border-line bg-card p-[22px] transition duration-300 dk:rounded-sm',
    href && 'hover:translate-x-1.5 hover:border-gold-500'
  )
  const body = (
    <>
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-ink [&_svg]:size-5">{icon}</span>
      <span className="min-w-0">
        <small className="block text-[0.74rem] tracking-[0.1em] text-chrome-500 uppercase">{label}</small>
        <b className="font-display text-[1.05rem] font-medium break-words text-chrome-100">{title}</b>
      </span>
    </>
  )
  return href ? (
    <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  )
}

export function ContactPage({ contact, services }: { contact: BusinessContact; services: string[] }) {
  const hours = contact.hours
  const rows: [string, string | undefined][] = [
    ['Mon – Fri', hours?.mon_fri],
    ['Saturday', hours?.sat],
    ['Sunday', hours?.sun],
  ]

  return (
    <>
      <PageHero
        image="/images/service-headlight.jpg"
        crumb="Contact"
        eyebrow="Get in touch"
        title="Let's talk about"
        accent="your car"
        description="The fastest way to reach us is WhatsApp. You can also call, email, or send a message below."
      />

      <SectionShell className="pt-8 sm:pt-12">
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <CCard icon={<WhatsAppIcon />} label="WhatsApp — fastest" title={contact.whatsappDisplay} href={contact.whatsappUrl} external />
            <CCard icon={<Phone />} label="Call us" title={contact.whatsappDisplay} href={`tel:+${contact.whatsappNumber}`} />
            <CCard icon={<Mail />} label="Email" title={contact.email} href={`mailto:${contact.email}`} />
            <CCard icon={<MapPin />} label="Coverage" title={`Doorstep service across ${SERVICE_CITY}`} />
            <div className="rounded-xl border border-line bg-card p-6 dk:rounded-sm">
              <h4 className="mb-3.5 flex items-center gap-2 text-[0.78rem] font-semibold tracking-[0.16em] text-gold-ink uppercase">
                <Clock className="size-4" /> Opening hours
              </h4>
              {hours ? (
                rows.map(([day, value]) => (
                  <div key={day} className="flex justify-between border-b border-dashed border-line py-2.5 text-[0.94rem] last:border-0">
                    <span className="text-chrome-400">{day}</span>
                    <b className="font-medium text-chrome-100">{value || 'Closed'}</b>
                  </div>
                ))
              ) : (
                <p className="text-[0.94rem] text-chrome-400">Message us any time — we reply as soon as we can.</p>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="rounded-2xl border border-line bg-card p-6 sm:p-9 dk:rounded-sm dk:border-gold-500/45">
              <h3 className="mb-1.5 font-display text-[1.4rem] font-semibold text-chrome-100">Send us a message</h3>
              <p className="mb-6 text-chrome-400">We usually reply within a few hours.</p>
              <ContactForm services={services} />
            </div>
          </Reveal>
        </div>
      </SectionShell>
    </>
  )
}
