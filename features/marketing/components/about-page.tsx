import Link from 'next/link'
import { ArrowRight, Droplets, Home, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'
import { WARRANTY_YEARS } from '@/lib/contact'
import { PageHero } from './page-hero'

const VALUES = [
  {
    icon: Droplets,
    title: 'Restoration, not replacement',
    text: 'Hazed, spotted or wiper-scratched glass can usually be restored with cerium-oxide polishing, a fraction of the cost of new glass.',
  },
  {
    icon: Home,
    title: 'We come to you',
    text: 'A technician arrives at your home or office anywhere in Lahore with everything needed. No garage visit, no waiting room.',
  },
  {
    icon: ShieldCheck,
    title: 'Backed by a warranty',
    text: `Every restoration carries a ${WARRANTY_YEARS}-year results warranty. If it hazes or spots again from normal use, we come back.`,
  },
  {
    icon: Sparkles,
    title: 'Honest, upfront pricing',
    text: 'You see the exact price for your car before booking and pay after the job, once you have seen the result.',
  },
]

export function AboutPage({ whatsappUrl }: { whatsappUrl: string }) {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title="Premium glass care, brought to your door"
        description="Car Aurum is a Lahore-based doorstep service for windshield restoration, full glass polishing and headlight restoration, built around clear prices and results we stand behind."
      />

      <section className="mx-auto max-w-3xl px-4 pb-8 sm:px-6 sm:pb-12">
        <Reveal className="space-y-4 text-base leading-relaxed text-chrome-300">
          <p>
            Night glare, water spots and wiper marks make driving tiring and unsafe, and most people are told the only fix is new glass. We
            built Car Aurum because there is a better answer: restore the glass you already have, at your doorstep, at a price you can see
            before you commit.
          </p>
          <p>
            Our technicians arrive with the equipment, work carefully around your car, and finish in about an hour. You inspect the result
            and pay only when you are happy with it.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 sm:pb-16">
        <div className="grid gap-5 sm:grid-cols-2">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 dk:rounded-md">
                <span className="flex size-10 items-center justify-center rounded-lg bg-brand text-brand-foreground dk:rounded-xs">
                  <v.icon className="size-5" />
                </span>
                <h2 className="mt-4 font-display text-lg font-semibold text-foreground">{v.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" className="h-12 px-6 text-base" render={<Link href="/quote" />}>
            Get your price
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-6 text-base" render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}>
            Talk to us on WhatsApp
          </Button>
        </div>
      </section>
    </>
  )
}
