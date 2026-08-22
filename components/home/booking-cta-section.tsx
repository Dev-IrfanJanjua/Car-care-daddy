import Link from 'next/link'
import { ArrowRight, ShieldCheck, Star, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlowBackground } from './glow-background'
import { Reveal } from './reveal'

const trustPoints = [
  { icon: ShieldCheck, label: 'Satisfaction guaranteed' },
  { icon: Timer, label: 'Under an hour' },
  { icon: Star, label: '4.9/5 average rating' },
]

export function BookingCtaSection() {
  return (
    <section className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-4 py-20 text-center sm:px-6 sm:py-24">
      <GlowBackground className="rounded-3xl" />
      <div className="absolute inset-0 -z-10 rounded-3xl border border-border/60 bg-card/60 backdrop-blur" />

      <Reveal>
        <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
          Ready for a car that turns heads?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Get an instant price and book your appointment in under a minute.
        </p>

        <Button size="lg" className="mt-8 h-12 px-7 text-base shadow-lg shadow-brand/25" render={<Link href="/quote" />}>
          Book Now
          <ArrowRight className="size-4" data-icon="inline-end" />
        </Button>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {trustPoints.map((point) => (
            <span key={point.label} className="flex items-center gap-1.5">
              <point.icon className="size-4 text-brand" />
              {point.label}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
