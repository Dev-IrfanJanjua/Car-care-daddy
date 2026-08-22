import { ListChecks, CalendarCheck, Sparkles } from 'lucide-react'
import { Reveal } from './reveal'

const steps = [
  {
    title: 'Choose service',
    description: 'Chip repair, replacement, polishing, headlights — pick what your car needs.',
    icon: ListChecks,
  },
  {
    title: 'Book appointment',
    description: 'Grab a time slot that works for you. No calls, no back-and-forth.',
    icon: CalendarCheck,
  },
  {
    title: 'We clean & restore',
    description: 'Our technicians come to you — most jobs are done in under an hour.',
    icon: Sparkles,
  },
]

export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">How it works</h2>
        <p className="mt-3 text-muted-foreground">Three steps between you and a spotless car.</p>
      </Reveal>

      <div className="relative mt-16 grid gap-10 sm:grid-cols-3 sm:gap-6">
        <div className="absolute top-6 right-[16.5%] left-[16.5%] hidden h-px bg-linear-to-r from-transparent via-border to-transparent sm:block" />

        {steps.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.15}>
            <div className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-linear-to-br from-brand to-cyan-500 text-brand-foreground shadow-lg shadow-brand/30">
                <step.icon className="size-5" />
              </div>
              <span className="mt-4 text-xs font-bold tracking-wide text-brand uppercase">
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
