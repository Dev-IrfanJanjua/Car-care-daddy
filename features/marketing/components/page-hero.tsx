import type { ReactNode } from 'react'

/** Compact heading band shared by the inner pages (services, about, contact). */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <section className="relative bg-background pt-14 pb-10 sm:pt-20 sm:pb-14">
      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6">
        <span className="text-xs font-semibold tracking-[0.18em] text-gold-ink uppercase">{eyebrow}</span>
        <span className="rule-gold mt-3" />
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-balance text-chrome-100 sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-chrome-300 sm:text-lg">{description}</p>
        {children}
      </div>
    </section>
  )
}
