import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * The eyebrow / headline / lead block that opens every home section.
 * `accent` is the part of the headline set in the brand colour.
 */
export function SectionHead({
  eyebrow,
  title,
  accent,
  lead,
  center = false,
  className,
}: {
  eyebrow: string
  title: ReactNode
  accent?: string
  lead?: string
  center?: boolean
  className?: string
}) {
  return (
    <div className={cn('mb-4 max-w-[720px] sm:mb-6', center && 'mx-auto text-center', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.26em] text-gold-ink uppercase before:h-px before:w-[34px] before:bg-current before:content-[""] dk:tracking-[0.3em]',
          center && 'justify-center'
        )}
      >
        {eyebrow}
      </span>
      <h2 className="mt-2.5 mb-3 font-display text-[clamp(1.6rem,3vw,2.35rem)] leading-[1.18] font-semibold tracking-[-0.03em] text-balance text-chrome-100">
        {title}
        {accent && (
          <>
            {' '}
            <span className="text-gold-ink">{accent}</span>
          </>
        )}
      </h2>
      {lead && <p className={cn('max-w-[60ch] text-[1.05rem] text-chrome-400', center && 'mx-auto')}>{lead}</p>}
    </div>
  )
}

/** Standard vertical rhythm + width for a home section. */
export function SectionShell({
  id,
  children,
  className,
  flush = false,
}: {
  id?: string
  children: ReactNode
  className?: string
  /** drop the top padding (used when a section follows a related one) */
  flush?: boolean
}) {
  return (
    <section id={id} className={cn('relative py-6 sm:py-8', flush && 'pt-0 sm:pt-0', className)}>
      <div className="mx-auto max-w-[1200px] px-[18px] sm:px-6">{children}</div>
    </section>
  )
}
