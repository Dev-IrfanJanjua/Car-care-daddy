'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlowBackground } from './glow-background'
import { HeroVisual } from './hero-visual'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <GlowBackground />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:py-32">
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur lg:mx-0"
          >
            <ShieldCheck className="size-3.5 text-brand" />
            Mobile auto glass that comes to you
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            Chipped glass,{' '}
            <span className="bg-linear-to-r from-brand to-cyan-500 bg-clip-text text-transparent">
              fixed at your door
            </span>
            .
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto mt-5 max-w-lg text-lg text-muted-foreground lg:mx-0"
          >
            Windshield chip repair, replacement, polishing, and headlight restoration — priced
            instantly, booked in a minute, done at your driveway.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Button size="lg" className="h-12 px-6 text-base shadow-lg shadow-brand/25" render={<Link href="/quote" />}>
              Book Now
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-6 text-base" render={<Link href="#services" />}>
              See our services
            </Button>
          </motion.div>
        </div>

        <HeroVisual />
      </div>
    </section>
  )
}
