import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = ['Service', 'Information', 'Date & Time', 'Confirmation'] as const

export type WizardStep = 1 | 2 | 3 | 4

/**
 * The booking wizard's persistent shell: a numbered step sidebar (desktop) or
 * compact progress bar (mobile) beside a content panel, with a Back/Next bar
 * pinned to the panel's bottom.
 *
 * A plain presentational component, not a client component or a Next layout:
 * every step (Service, on its own route) and the consolidated
 * Information/Date & Time/Confirmation wizard (one route, its own step state)
 * render this the same way, passing in whichever `footer` buttons make sense
 * for where they are. That's what lets step 1 live on a real route while
 * steps 2-4 share one, without this component needing to know the difference.
 */
export function WizardShell({
  currentStep,
  title,
  description,
  phone,
  footer,
  children,
}: {
  currentStep: WizardStep
  title: string
  description?: string
  phone: { display: string; telHref: string }
  footer: ReactNode
  children: ReactNode
}) {
  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xl shadow-gold-700/10 dk:rounded-md lg:grid lg:grid-cols-[260px_1fr]">
        {/* Mobile: a compact bar instead of the full vertical sidebar -- 260px
            of step list would push the actual form below the fold on a phone. */}
        <div className="border-b border-border/60 bg-ink-950 px-5 py-4 lg:hidden">
          <div className="flex items-center justify-between text-xs font-medium text-chrome-500">
            <span>
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-gold-ink">{STEPS[currentStep - 1]}</span>
          </div>
          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-ink-700">
            <div
              className="h-full rounded-full bg-gold-500 transition-[width] duration-500"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <aside className="hidden flex-col justify-between bg-ink-950 p-8 lg:flex">
          <nav aria-label="Booking progress">
            <ol className="flex flex-col gap-7">
              {STEPS.map((label, i) => {
                const index = (i + 1) as WizardStep
                const done = index < currentStep
                const current = index === currentStep
                return (
                  <li key={label} className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors',
                        done && 'bg-gold text-gold-foreground',
                        current && 'bg-gold text-gold-foreground ring-4 ring-gold-500/25',
                        !done && !current && 'bg-ink-800 text-chrome-500 ring-1 ring-ink-600'
                      )}
                    >
                      {done ? <Check className="size-4" /> : index}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        current ? 'font-semibold text-gold-ink' : done ? 'text-chrome-100' : 'text-chrome-500'
                      )}
                    >
                      {label}
                    </span>
                  </li>
                )
              })}
            </ol>
          </nav>

          <div className="mt-10 border-t border-border pt-5">
            <p className="text-xs text-chrome-500">Have any questions?</p>
            <a
              href={phone.telHref}
              className="mt-1 block text-sm font-semibold text-gold-ink hover:underline"
            >
              {phone.display}
            </a>
          </div>
        </aside>

        <div className="flex flex-col">
          <div className="border-b border-border/60 px-5 py-5 sm:px-8">
            <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>

          <div className="flex-1 px-5 py-6 sm:px-8">{children}</div>

          <div className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-4 sm:px-8">
            {footer}
          </div>
        </div>
      </div>
    </main>
  )
}
