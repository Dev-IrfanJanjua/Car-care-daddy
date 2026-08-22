import Link from 'next/link'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = ['Vehicle', 'Services', 'Quote', 'Booking']

export function QuoteProgress({
  step,
  hrefs = [],
}: {
  step: 1 | 2 | 3 | 4
  /** Href for each completed step's circle, indexed 0-3. Omit an entry to keep that circle non-interactive. */
  hrefs?: (string | undefined)[]
}) {
  return (
    <div className="mb-8">
      <div className="relative flex items-center justify-between">
        <div className="absolute inset-x-4 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-500"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {STEPS.map((label, i) => {
          const index = i + 1
          const done = index < step
          const current = index === step
          const href = done ? hrefs[i] : undefined

          const circle = (
            <span
              className={cn(
                'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-background text-xs font-semibold transition-colors',
                (done || current) && 'border-brand bg-brand text-brand-foreground',
                !done && !current && 'border-border text-muted-foreground',
                current && 'ring-4 ring-brand/20'
              )}
            >
              {done ? <Check className="size-4" /> : index}
            </span>
          )

          return href ? (
            <Link
              key={label}
              href={href}
              className="group flex flex-col items-center gap-1.5"
              aria-label={`Back to ${label}`}
            >
              <span className="transition-transform group-hover:scale-110">{circle}</span>
              <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
                {label}
              </span>
            </Link>
          ) : (
            <span key={label} className="flex flex-col items-center gap-1.5">
              {circle}
              <span
                className={cn(
                  'text-[11px] font-medium',
                  current ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
