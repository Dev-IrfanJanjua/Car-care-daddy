'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * Each quote step is its own route, so this remounts on navigation and the
 * enter animation replays -- giving the wizard a sense of moving forward
 * without any client-side router state.
 */
export function StepTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
