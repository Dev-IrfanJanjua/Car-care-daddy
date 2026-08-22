import Link from 'next/link'
import { ArrowRight, ShieldCheck, Star, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlowBackground } from './glow-background'
import { Reveal } from './reveal'

const trustPoints = [
  { icon: ShieldCheck, label: '3-year results warranty' },
  { icon: Timer, label: 'Doorstep service in Lahore' },
  { icon: Star, label: '4.9/5 average rating' },
]

export function BookingCtaSection() {
  return (
    <section className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-4 py-10 text-center sm:px-6 sm:py-16">
      <GlowBackground className="rounded-3xl" />
      <div className="absolute inset-0 -z-10 rounded-3xl border border-border/60 bg-card/60 backdrop-blur" />

      <Reveal className="flex flex-col items-center">
        <span className="text-xs font-semibold tracking-[0.18em] text-gold-ink uppercase">
          Book in a minute
        </span>
        <span className="rule-gold mt-3" />
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
          Ready for a crystal-clear windshield?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Get an instant price and book your doorstep appointment in under a minute.
        </p>

        <Button
          size="lg"
          className="mt-8 h-12 px-7 text-base shadow-lg shadow-navy-900/25"
          render={<Link href="/quote" />}
        >
          Book Now
          <ArrowRight className="size-4" data-icon="inline-end" />
        </Button>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {trustPoints.map((point) => (
            <span key={point.label} className="flex items-center gap-1.5">
              <point.icon className="size-4 text-gold-ink" />
              {point.label}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
