'use client'

import { MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * reducedMotion="user" makes every motion component in the app honour the OS
 * "reduce motion" setting -- transforms are dropped and only opacity animates.
 * Children stay server components; they're passed through as a prop.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
