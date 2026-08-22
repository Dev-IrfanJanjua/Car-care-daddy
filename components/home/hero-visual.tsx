'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { Car, Sparkle, Star } from 'lucide-react'

export function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="relative mx-auto aspect-square w-full max-w-md"
    >
      <div className="relative flex size-full items-center justify-center overflow-hidden rounded-4xl border border-border/60 bg-linear-to-br from-card to-muted/40 shadow-2xl shadow-brand/10">
        <Image
          src="https://picsum.photos/id/1051/800/800"
          alt=""
          fill
          unoptimized
          className="object-cover opacity-40 saturate-125"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,color-mix(in_oklch,var(--brand),transparent_70%),transparent_70%)]" />
        <div className="absolute inset-0 bg-linear-to-t from-background/60 via-transparent to-transparent" />

        <motion.div
          className="absolute inset-y-0 w-1/3 -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent"
          animate={{ x: ['-120%', '220%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
        />

        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Car
            className="size-40 text-brand drop-shadow-[0_18px_40px_color-mix(in_oklch,var(--brand),transparent_60%)] sm:size-56"
            strokeWidth={1.25}
          />
        </motion.div>

        {[
          { top: '18%', left: '14%', delay: 0 },
          { top: '30%', left: '80%', delay: 0.6 },
          { top: '72%', left: '20%', delay: 1.2 },
        ].map((s, i) => (
          <motion.span
            key={i}
            className="absolute text-brand/70"
            style={{ top: s.top, left: s.left }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
          >
            <Sparkle className="size-5 fill-current" />
          </motion.span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="absolute -top-4 -left-4 flex items-center gap-1.5 rounded-full border border-border/60 bg-background/90 px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur"
      >
        <Star className="size-3.5 fill-brand text-brand" />
        4.9/5 rating
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        className="absolute -right-4 -bottom-4 rounded-full border border-border/60 bg-background/90 px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur"
      >
        500+ cars restored
      </motion.div>
    </motion.div>
  )
}
