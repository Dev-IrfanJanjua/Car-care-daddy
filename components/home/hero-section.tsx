'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowRight, Phone, ShieldCheck, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlowBackground } from './glow-background'

/**
 * Centred, gradient-and-glow hero -- no background video. The video that used
 * to loop behind this section now gets its own dedicated IntroVideoSection
 * right below, where it can be watched deliberately rather than serving as
 * ambience; this hero's job is just the headline and the two ways in.
 *
 * The phone number is a prop, not a fetch: this stays a client component for
 * the entrance motion, and getBusinessContact() is a server-only cached read
 * -- so the home page awaits it once and passes down what this needs.
 */
export function HeroSection({ phone }: { phone: { display: string; telHref: string } }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink-900 py-20 sm:py-28 lg:py-32">
      <GlowBackground />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-xs font-bold tracking-wide text-gold-foreground uppercase">
            <span aria-hidden className="size-1.5 rounded-full bg-ink-950" />
            Free doorstep service
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-ink-900/60 px-4 py-1.5 text-xs font-bold tracking-wide text-chrome-100 uppercase">
            <span className="flex items-center gap-0.5" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3 fill-gold text-gold" />
              ))}
            </span>
            Rated 4.9/5
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="mt-7 font-heading text-5xl leading-[0.95] font-bold text-balance text-chrome-100 uppercase sm:text-6xl lg:text-7xl"
        >
          Crystal-Clear Glass
          <br />
          <span className="bg-linear-to-r from-gold-300 via-gold-500 to-gold-400 bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(212,162,76,0.35)]">
            At Your Doorstep
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16 }}
          className="mt-5 text-2xl font-light text-chrome-300 italic sm:text-3xl"
        >
          Glass restoration experts in{' '}
          <span className="text-gold-ink underline decoration-gold-500/60 not-italic">
            Lahore
          </span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24 }}
          className="mx-auto mt-5 max-w-xl text-base text-chrome-300 sm:text-lg"
        >
          Professional CeO₂ windshield restoration and full glass polishing — we remove water
          spots, wiper marks and night glare, right at your home or office.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32 }}
          className="mx-auto mt-8 flex max-w-md flex-col items-stretch gap-3 sm:flex-row sm:justify-center"
        >
          <Button
            size="lg"
            className="relative h-12 overflow-hidden border-gold-400 bg-gold px-6 text-base text-gold-foreground shadow-lg shadow-ink-950/50 hover:border-gold-300 hover:bg-gold-400"
            render={<Link href="/quote" />}
          >
            {/* Specular sweep. CSS keyframes, so MotionConfig can't reach it --
                it carries its own reduced-motion guard. */}
            <span
              aria-hidden
              className="animate-shine pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-linear-to-r from-transparent via-white/45 to-transparent motion-reduce:hidden"
            />
            Book Now
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 border-border bg-ink-900/40 px-6 text-base text-chrome-100 hover:bg-ink-800"
            render={<a href={phone.telHref} />}
          >
            <Phone className="size-4" data-icon="inline-start" />
            Call: {phone.display}
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-2 text-sm text-chrome-500"
        >
          <ShieldCheck className="size-4 text-gold" />
          3-year results warranty on every job
        </motion.p>
      </div>

      {/* A crisp seam, not a fade. Gradient-fading ink into the next section
          just makes a band of muddy grey; a hard edge with a gold hairline
          reads as intentional and keeps the dark hero clearly bounded. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-gold-500/60 to-transparent" />
    </section>
  )
}
