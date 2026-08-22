'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

// Each orb is a large blur-3xl layer on an infinite loop. Driving them with
// `animate` ran all three from page load and never stopped -- including while
// the section sat far off-screen -- which cost frames on every scroll.
// `whileInView` with `once: false` parks them until the section is actually
// visible. amount: 0 means "any part on screen", so they're already moving by
// the time you reach it.
const ORBS = [
  {
    className: 'absolute -top-32 -left-24 size-96 rounded-full bg-navy-900/10 blur-3xl',
    motion: { x: [0, 40, 0], y: [0, 30, 0] },
    transition: { duration: 14, repeat: Infinity, ease: 'easeInOut' as const },
  },
  {
    className: 'absolute top-10 right-[-6rem] size-[28rem] rounded-full bg-gold-500/12 blur-3xl',
    motion: { x: [0, -30, 0], y: [0, 40, 0] },
    transition: { duration: 16, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 },
  },
  {
    className: 'absolute bottom-[-8rem] left-1/3 size-[24rem] rounded-full bg-chrome-300/25 blur-3xl',
    motion: { x: [0, 30, 0], y: [0, -20, 0] },
    transition: { duration: 18, repeat: Infinity, ease: 'easeInOut' as const, delay: 2 },
  },
]

export function GlowBackground({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[56px_56px] opacity-[0.25] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black_10%,transparent_75%)]" />
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className={orb.className}
          initial={false}
          whileInView={orb.motion}
          viewport={{ once: false, amount: 0 }}
          transition={orb.transition}
        />
      ))}
    </div>
  )
}
