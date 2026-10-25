import Image from 'next/image'
import Link from 'next/link'
import { Droplets, Home, ShieldCheck, Tag } from 'lucide-react'
import { Reveal } from '@/components/motion/reveal'
import { siteButton } from '@/components/ui/site-button'
import { WARRANTY_YEARS } from '@/lib/contact'
import { SectionShell } from '@/features/home'
import { PageHero } from './page-hero'

const VALUES = [
  {
    icon: Droplets,
    title: 'Expert restoration',
    text: 'Hazed, spotted or wiper-scratched glass can usually be restored with cerium-oxide polishing, a fraction of the cost of new glass.',
  },
  {
    icon: Home,
    title: 'Doorstep convenience',
    text: 'A technician arrives at your home or office anywhere in Lahore with everything needed. No garage visit, no waiting room.',
  },
  {
    icon: Tag,
    title: 'Transparent pricing',
    text: 'You see the exact price for your car before booking and pay after the job, once you have seen the result.',
  },
  {
    icon: ShieldCheck,
    title: `${WARRANTY_YEARS}-year warranty`,
    text: `Every restoration carries a ${WARRANTY_YEARS}-year results warranty. If it hazes or spots again from normal use, we come back.`,
  },
]

/** `rating` is the live average of public reviews (null until there are enough). */
export function AboutPage({ rating }: { rating: number | null }) {
  return (
    <>
      <PageHero
        image="/images/service-detailing.jpg"
        crumb="About"
        eyebrow="Our story"
        title="Lahore's"
        accent="doorstep glass specialists"
        description="Car Aurum restores windshields, glass and headlights at your home or office, with clear prices and results we stand behind."
      />

      <SectionShell>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-[72px]">
          <Reveal>
            <div className="zone-dark relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-ink-800 dk:rounded-sm">
              <Image
                src="/images/service-windshield.jpg"
                alt="A technician restoring a windshield"
                fill
                sizes="(min-width:1024px) 540px, 100vw"
                className="object-cover brightness-110 saturate-110"
              />
              <div className="absolute right-5 bottom-5 rounded-xl border border-line-2 bg-ink-900/75 px-[22px] py-[18px] backdrop-blur-md">
                <b className="block font-display text-[1.7rem] leading-none text-gold-ink">{WARRANTY_YEARS} years</b>
                <small className="text-chrome-400">results warranty</small>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <span className="inline-flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.26em] text-gold-ink uppercase before:h-px before:w-[34px] before:bg-current before:content-['']">
              Our story
            </span>
            <h2 className="mt-2.5 mb-4 font-display text-[clamp(1.6rem,3vw,2.35rem)] leading-[1.18] font-semibold tracking-[-0.03em] text-balance text-chrome-100">
              Specialists, <span className="text-gold-ink">not a car-wash</span>
            </h2>
            <div className="space-y-4 text-chrome-400">
              <p>
                Night glare, water spots and wiper marks make driving tiring and unsafe, and most people are told the only fix is new glass. We
                built Car Aurum because there is a better answer: restore the glass you already have, at your doorstep, at a price you can see
                before you commit.
              </p>
              <p>
                Our technicians arrive with the equipment, work carefully around your car, and finish in about an hour. You inspect the result
                and pay only when you are happy with it.
              </p>
            </div>
            <div className="my-7 flex flex-wrap gap-9">
              <Stat value={`${WARRANTY_YEARS} yr`} label="Warranty" />
              <Stat value="60–90 min" label="Per visit" />
              {rating != null ? <Stat value={rating.toFixed(1)} label="Customer rating" /> : <Stat value="Free" label="Doorstep visit" />}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/quote" className={siteButton()}>
                Book a service
              </Link>
              <Link href="/contact" className={siteButton({ variant: 'ghost' })}>
                Contact us
              </Link>
            </div>
          </Reveal>
        </div>
      </SectionShell>

      <SectionShell flush>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.06} className="flex">
              <div className="w-full rounded-[18px] border border-line bg-card p-6 dk:rounded-sm dk:border-gold-500/45">
                <v.icon aria-hidden className="mb-[18px] size-7 text-gold-ink" />
                <h3 className="mb-2 font-display text-[1.05rem] font-semibold text-chrome-100">{v.title}</h3>
                <p className="text-[0.92rem] text-chrome-400">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </SectionShell>
    </>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <b className="block font-display text-[1.7rem] leading-none font-semibold text-gold-ink">{value}</b>
      <small className="text-chrome-400">{label}</small>
    </div>
  )
}
