'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowRight, MapPin, ShieldCheck, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeroBackdrop } from './hero-backdrop'

const TRUST = [
  { icon: ShieldCheck, label: '3-year warranty' },
  { icon: MapPin, label: 'Doorstep in Lahore' },
  { icon: Star, label: 'Rated 4.9/5' },
]

/**
 * Smooth-scrolls to the services section instead of hard-jumping.
 *
 * The href stays on the link, so this degrades to a native anchor jump without
 * JS and keeps middle-click / cmd-click working. `scroll-padding-top` on html
 * supplies the offset that clears the fixed header.
 */
function scrollToServices(event: React.MouseEvent<HTMLAnchorElement>) {
  // Leave modified clicks to the browser (new tab, new window, download).
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

  const target = document.getElementById('services')
  if (!target) return

  event.preventDefault()
  target.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
    block: 'start',
  })
  // Keep the URL shareable without letting the browser also jump.
  history.replaceState(null, '', '#services')
}

export function HeroSection() {
  return (
    // min-h uses svh, not vh: on mobile Safari vh is the *largest* viewport, so
    // the bottom fade would hide under the URL bar until you scrolled.
    <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden bg-navy-950">
      <HeroBackdrop />

      {/* The header is fixed on this page, so the hero owns the space it would
          otherwise have taken in the flow. */}
      <div className="mx-auto w-full max-w-6xl px-4 pt-32 pb-16 sm:px-6 sm:pt-40 sm:pb-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            // No backdrop-blur on anything sitting over the video: a
            // backdrop-filter forces the compositor to re-read the decoded
            // frame underneath it every frame.
            className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-navy-950/45 px-3 py-1 text-xs font-medium text-chrome-300"
          >
            <ShieldCheck className="size-3.5 text-gold" />
            Doorstep service in Lahore · 3-year warranty
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="text-4xl font-extrabold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl"
          >
            Crystal-clear glass,{' '}
            <span className="bg-linear-to-r from-gold-300 via-gold-500 to-gold-400 bg-clip-text text-transparent">
              at your doorstep
            </span>
            .
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 max-w-lg text-lg text-chrome-300"
          >
            Professional CeO₂ windshield restoration and full glass polishing — removes water spots,
            wiper marks and night glare. Priced instantly, done at your doorstep in Lahore.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          >
            <Button
              size="lg"
              className="relative h-12 overflow-hidden border-gold-400 bg-gold px-6 text-base text-gold-foreground shadow-lg shadow-navy-950/50 hover:border-gold-300 hover:bg-gold-400"
              render={<Link href="/quote" />}
            >
              {/* Specular sweep. CSS keyframes, so MotionConfig can't reach it
                  -- it carries its own reduced-motion guard. */}
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
              className="h-12 border-white/30 bg-navy-950/40 px-6 text-base text-white hover:bg-navy-950/65 hover:text-white"
              render={<Link href="#services" onClick={scrollToServices} />}
            >
              See our services
            </Button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-chrome-300"
          >
            {TRUST.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="size-4 text-gold" />
                {label}
              </li>
            ))}
          </motion.ul>
        </div>
      </div>

      {/* A crisp seam, not a fade. Gradient-fading navy into white just makes a
          band of grey; a hard edge with a gold hairline reads as intentional
          and keeps the one dark band clearly bounded. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-gold-500/60 to-transparent" />
    </section>
  )
}
