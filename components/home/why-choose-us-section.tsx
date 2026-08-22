import { UserStar, Timer, Wallet, ThumbsUp, type LucideIcon } from 'lucide-react'
import { Reveal } from './reveal'

const reasons: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: 'Professional Service',
    description: 'Trained, background-checked technicians who treat every car like their own.',
    icon: UserStar,
  },
  {
    title: 'Fast',
    description: 'Most services are done in under an hour, right at your driveway or office.',
    icon: Timer,
  },
  {
    title: 'Affordable',
    description: 'Transparent, upfront pricing — see the exact cost before you book.',
    icon: Wallet,
  },
  {
    title: 'Satisfaction Guaranteed',
    description: "Not happy with the finish? We'll come back and make it right.",
    icon: ThumbsUp,
  },
]

export function WhyChooseUsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Why choose us</h2>
      </Reveal>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((reason, i) => (
          <Reveal key={reason.title} delay={i * 0.1} className="h-full">
            <div className="flex h-full flex-col gap-3 rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-brand/40">
              <span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
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
