import { ListChecks, CalendarCheck, Sparkles } from 'lucide-react'
import { Reveal } from './reveal'

const steps = [
  {
    title: 'Choose service',
    description: 'Windshield restoration or full glass polishing — pick what your car needs.',
    icon: ListChecks,
  },
  {
    title: 'Book appointment',
    description: 'Grab a time slot that works for you. No calls, no back-and-forth.',
    icon: CalendarCheck,
  },
  {
    title: 'We clean & restore',
    description: 'Our technicians come to you anywhere in Lahore.',
    icon: Sparkles,
  },
]

export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <span className="text-xs font-semibold tracking-[0.18em] text-gold-ink uppercase">
          The process
        </span>
        <span className="rule-gold mt-3" />
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">How it works</h2>
        <p className="mt-3 text-muted-foreground">Three steps between you and crystal-clear glass.</p>
      </Reveal>

      <div className="relative mt-12 grid gap-10 sm:grid-cols-3 sm:gap-6">
        <div className="absolute top-6 right-[16.667%] left-[16.667%] hidden h-px bg-linear-to-r from-transparent via-border to-transparent sm:block"
          /* 3 columns -> centres sit 1/6 in from each end; top-6 is half
             of the size-12 circles, so the line runs through them. */ />

        {steps.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.15}>
            <div className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-linear-to-br from-navy-800 to-navy-950 text-gold shadow-lg shadow-navy-900/25 ring-1 ring-gold-hairline">
                <step.icon className="size-5" />
              </div>
              <span className="mt-4 text-xs font-bold tracking-[0.18em] text-gold-ink uppercase">
                Step {i + 1}
              </span>
              <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 max-w-56 text-sm text-muted-foreground">{step.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
