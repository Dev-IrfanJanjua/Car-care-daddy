import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Eye, ShieldCheck, Sparkles, Timer, Wallet, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from './reveal'

// Every claim below is one already made elsewhere in this app (CeO₂ compounds,
// doorstep Lahore, 60-90 minutes, transparent pricing, the 3-year warranty) --
// this section just gives each one its own row instead of leaving them all in
// one paragraph.
const REASONS: {
  titleWhite: string
  titleGold: string
  description: string
  icon: LucideIcon
}[] = [
  {
    titleWhite: 'Expert',
    titleGold: 'Restoration',
    description:
      'Trained technicians using professional CeO₂ compounds and precision machine polishing on every job.',
    icon: Eye,
  },
  {
    titleWhite: 'Doorstep',
    titleGold: 'Convenience',
    description:
      'We come to your home or office anywhere in Lahore — most jobs take just 60–90 minutes.',
    icon: Timer,
  },
  {
    titleWhite: 'Transparent',
    titleGold: 'Pricing',
    description: 'See your exact price before you book — no hidden fees, no surprises after.',
    icon: Wallet,
  },
  {
    titleWhite: '3-Year',
    titleGold: 'Warranty',
    description: 'Every windshield and glass restoration is backed by a 3-year results warranty.',
    icon: ShieldCheck,
  },
]

export function WhyChooseUsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
        <Reveal className="flex flex-col">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-ink-900/60 px-4 py-1.5 text-xs font-bold tracking-wide text-chrome-100 uppercase">
            <span aria-hidden className="size-1.5 rounded-full bg-gold-500" />
            Why choose us
          </span>

          <h2 className="mt-5 font-display text-4xl leading-[0.98] font-bold text-balance text-chrome-100 uppercase sm:text-5xl">
            The Right Care
            <br />
            <span className="bg-linear-to-r from-gold-300 via-gold-500 to-gold-400 bg-clip-text text-transparent">
              For Your Windshield
            </span>
          </h2>

          <p className="mt-4 max-w-md text-chrome-300">
            We specialise in windshield restoration, full glass polishing and headlight
            restoration — bringing back clarity, safety and the original look of your car, backed
            by a 3-year results warranty.
          </p>

          <div className="relative mt-6 aspect-[4/5] max-w-md overflow-hidden rounded-2xl border border-border/60">
            <Image
              src="/images/service-headlight.jpg"
              alt="Restored headlight on a detailed car"
              fill
              sizes="(min-width: 1024px) 448px, (min-width: 640px) 60vw, 100vw"
              style={{ objectPosition: 'center 60%' }}
              className="object-cover"
            />
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-gold-hairline bg-ink-950/80 px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-chrome-100 uppercase backdrop-blur-sm">
              <Sparkles className="size-3.5 text-gold" />
              Clearer vision. Safer drives.
            </span>
          </div>
        </Reveal>

        <div className="flex flex-col gap-4">
          {REASONS.map((reason, i) => (
            <Reveal key={reason.titleGold} delay={i * 0.08}>
              <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-colors hover:border-gold/50 sm:p-6">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-ink-700 to-ink-950 text-gold ring-1 ring-gold-hairline">
                  <reason.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-bold">
                    <span className="text-chrome-100">{reason.titleWhite}</span>{' '}
                    <span className="text-gold-ink">{reason.titleGold}</span>
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{reason.description}</p>
                </div>
              </div>
            </Reveal>
          ))}

          <Reveal delay={REASONS.length * 0.08} className="mt-2">
            <Button size="lg" className="h-12 px-6 text-base" render={<Link href="/quote" />}>
              Book Your Service
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
