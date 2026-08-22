import { UserStar, Timer, Wallet, ThumbsUp, type LucideIcon } from 'lucide-react'
import { Reveal } from './reveal'

const reasons: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: 'Professional Service',
    description: 'Trained technicians using professional CeO₂ compounds and machine polishing.',
    icon: UserStar,
  },
  {
    title: 'Fast',
    description: 'We come to your home or office anywhere in Lahore — no workshop visit needed.',
    icon: Timer,
  },
  {
    title: 'Affordable',
    description: 'Transparent, upfront pricing in rupees — see the exact cost before you book.',
    icon: Wallet,
  },
  {
    title: '3-Year Warranty',
    description: "Our windshield restoration is backed by a 3-year results warranty.",
    icon: ThumbsUp,
  },
]

export function WhyChooseUsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <span className="text-xs font-semibold tracking-[0.18em] text-gold-ink uppercase">
          The difference
        </span>
        <span className="rule-gold mt-3" />
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Why choose us</h2>
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((reason, i) => (
          <Reveal key={reason.title} delay={i * 0.1} className="h-full">
            <div className="flex h-full flex-col gap-3 rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-gold/50">
              <span className="flex size-10 items-center justify-center rounded-lg bg-navy-900/8 text-navy-800 ring-1 ring-gold-hairline">
                <reason.icon className="size-5" />
              </span>
              <h3 className="font-semibold">{reason.title}</h3>
              <p className="text-sm text-muted-foreground">{reason.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
