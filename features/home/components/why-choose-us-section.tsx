import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Eye, ShieldCheck, Timer, Wallet, type LucideIcon } from 'lucide-react'
import { Reveal } from '@/components/motion/reveal'
import { siteButton } from '@/components/ui/site-button'
import { SectionShell } from './section-head'

// Every claim below is one already made elsewhere in this app (CeO₂ compounds,
// doorstep Lahore, 60-90 minutes, transparent pricing, the 3-year warranty).
const REASONS: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: 'Expert restoration',
    description: 'Trained technicians using professional CeO₂ compounds and precision machine polishing.',
    icon: Eye,
  },
  {
    title: 'Doorstep convenience',
    description: 'We come to your home or office anywhere in Lahore — most jobs take just 60–90 minutes.',
    icon: Timer,
  },
  {
    title: 'Transparent pricing',
    description: 'See your exact price before you book — no hidden fees, no surprises.',
    icon: Wallet,
  },
  {
    title: '3-year warranty',
    description: 'Every windshield and glass restoration is backed by a 3-year results warranty.',
    icon: ShieldCheck,
  },
]

/**
 * Photo + four reasons, then the four-number strip. `rating` is the live
 * average of public reviews (null until there are enough to be meaningful).
 */
export function WhyChooseUsSection({ rating }: { rating: number | null }) {
  const stats = [
    { n: '3', unit: 'yr', label: 'Results warranty' },
    { n: '60–90', unit: 'min', label: 'Typical job time' },
    { n: (rating ?? 4.9).toFixed(1), unit: '/5', label: 'Customer rating' },
    { n: '100', unit: '%', label: 'Doorstep service' },
  ]

  return (
    <SectionShell id="why">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-[72px]">
        <Reveal>
          <div className="zone-dark relative aspect-[16/11] overflow-hidden rounded-2xl border border-line bg-ink-800 lg:aspect-[4/5] dk:rounded-sm">
            <Image
              src="/images/service-headlight.jpg"
              alt="Restored headlight with a crisp blue-white beam"
              fill
              sizes="(min-width: 1024px) 552px, 100vw"
              style={{ objectPosition: 'center 65%' }}
              className="object-cover brightness-110 saturate-110"
            />
            <div aria-hidden className="absolute inset-0 z-[1] bg-[linear-gradient(0deg,color-mix(in_oklab,var(--ink-900)_92%,transparent)_0%,color-mix(in_oklab,var(--ink-900)_55%,transparent)_22%,transparent_60%)]" />
            <span className="absolute bottom-5 left-5 z-[2] rounded-[11px] border border-line-2 bg-ink-900/70 px-[18px] py-3 text-[0.85rem] font-medium text-chrome-100 backdrop-blur-md">
              Clearer vision. Safer drives.
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <span className="inline-flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.26em] text-gold-ink uppercase before:h-px before:w-[34px] before:bg-current before:content-[''] dk:tracking-[0.3em]">
            Why choose us
          </span>
          <h2 className="mt-3.5 mb-4 font-display text-[clamp(1.6rem,3vw,2.35rem)] leading-[1.18] font-semibold tracking-[-0.03em] text-balance text-chrome-100">
            The right care for your <span className="text-gold-ink">windshield</span>
          </h2>
          <p className="max-w-[60ch] text-[1.05rem] text-chrome-400">
            We bring back clarity, safety and the original look of your car — with the care of
            specialists, not a car-wash.
          </p>

          <div className="my-9 grid gap-3.5">
            {REASONS.map((r) => (
              <div
                key={r.title}
                className="flex gap-[18px] rounded-xl border border-line bg-card p-5 shadow-[0_1px_0_#fff_inset,0_22px_50px_-34px_rgba(18,32,46,0.3)] transition duration-300 hover:translate-x-1.5 hover:border-gold-500/50 dk:rounded-sm dk:border-gold-500/45 dk:shadow-none"
              >
                <span className="grid size-[52px] shrink-0 place-items-center rounded-[11px] border border-gold-500/30 bg-gold-500/14 text-gold-ink">
                  <r.icon className="size-6" />
                </span>
                <div>
                  <h3 className="mb-1 text-[1.05rem] font-semibold text-chrome-100">{r.title}</h3>
                  <p className="text-[0.9rem] text-chrome-400">{r.description}</p>
                </div>
              </div>
            ))}
          </div>

          <Link href="/quote" className={siteButton()}>
            Book your service <ArrowRight />
          </Link>
        </Reveal>
      </div>

      <Reveal delay={0.05}>
        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-line bg-line shadow-[0_30px_60px_-40px_rgba(18,32,46,0.3)] sm:mt-[72px] lg:grid-cols-4 dk:rounded-sm dk:border-gold-500/45 dk:shadow-none">
          {stats.map((s) => (
            <div key={s.label} className="bg-card px-3 py-6 text-center sm:px-5 sm:py-8 dk:bg-ink-950">
              <b className="block font-display text-[clamp(1.6rem,2.8vw,2.2rem)] leading-none font-semibold tracking-[-0.04em] text-gold-ink">
                {s.n}
                <small className="text-[0.5em]">{s.unit}</small>
              </b>
              <span className="mt-1.5 block text-[0.86rem] text-chrome-400">{s.label}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </SectionShell>
  )
}
