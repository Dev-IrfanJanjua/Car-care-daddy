'use client'

import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * One accordion row. The answer sits in a 0fr → 1fr grid track so the height
 * animates smoothly to its natural size (no max-height guesswork), with a short
 * fade. Content stays in the DOM, so it remains readable to search engines and
 * screen readers; `inert` keeps the collapsed answer out of the tab order.
 */
export function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div className="px-5">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left font-medium text-foreground"
        >
          {q}
          <ChevronDown
            aria-hidden
            className={cn('size-4 shrink-0 text-gold-ink transition-transform duration-300 ease-out', open && 'rotate-180')}
          />
        </button>
      </h3>
      <div
        id={id}
        role="region"
        inert={!open}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <p className="pb-4 text-sm leading-relaxed text-muted-foreground">{a}</p>
        </div>
      </div>
    </div>
  )
}
