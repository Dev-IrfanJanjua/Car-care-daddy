import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { Reveal } from '@/components/motion/reveal'
import { siteButton } from '@/components/ui/site-button'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { PricedBundle } from '@/features/bundles'
import { SectionHead, SectionShell } from './section-head'

/**
 * Bundles: several services sold together at a percentage off. Everything on a
 * card (name, badge, blurb, the services inside, the discount) is a row in the
 * bundles table; the "from" price is worked out from the services' own prices,
 * so it can never drift from what the quote flow charges. A bundle that holds a
 * service on hold shows as "Coming soon". The section is hidden when empty.
 */
export function BundlesSection({ bundles }: { bundles: PricedBundle[] }) {
  if (bundles.length === 0) return null

  return (
    <SectionShell id="bundles">
      <Reveal>
        <SectionHead
          center
          eyebrow="Bundles"
          title="Bundle &amp;"
          accent="save more"
          lead="Combine services in one doorstep visit and save — the bundle price applies automatically when you book."
        />
      </Reveal>

      <div className="flex flex-wrap justify-center gap-[30px] pt-3 lg:gap-[22px]">
        {bundles.map((b, i) => {
          const feat = /best|ultimate/i.test(b.badge ?? '')
          return (
            <Reveal key={b.id} delay={i * 0.08} className="flex w-full max-w-[520px] lg:w-[calc((100%-44px)/3)] lg:max-w-none">
              <article
                className={cn(
                  'relative flex w-full flex-col rounded-[26px] border bg-card px-7 pt-[34px] pb-7 shadow-[0_22px_50px_-36px_rgba(18,32,46,0.35)] transition duration-300 hover:-translate-y-1.5 hover:border-gold-500/45 dk:rounded-sm',
                  feat ? 'border-gold-500/60 shadow-[0_0_0_1px_color-mix(in_oklab,var(--gold-500)_25%,transparent),0_30px_60px_-34px_color-mix(in_oklab,var(--gold-500)_50%,transparent)]' : 'border-line dk:border-gold-500/45'
                )}
              >
                {b.badge && (
                  <span className="absolute -top-3 left-7 rounded-full bg-gold-500 px-3.5 py-1 text-[0.7rem] font-bold tracking-[0.1em] text-gold-foreground uppercase dk:rounded-xs">
                    {b.badge}
                  </span>
                )}
                <h3 className="mb-2 font-display text-[1.35rem] font-semibold text-chrome-100">{b.name}</h3>
                {b.description && <p className="mb-[18px] text-[0.92rem] text-chrome-400">{b.description}</p>}
                <ul className="mb-[22px] grid gap-2">
                  {b.items.map((name) => (
                    <li key={name} className="flex gap-2.5 text-[0.92rem] font-medium text-chrome-100">
                      <Check aria-hidden className="mt-0.5 size-[18px] shrink-0 rounded-full bg-gold-500/20 p-[3px] text-gold-ink" strokeWidth={3} />
                      {name}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto mb-[18px] flex flex-wrap items-baseline gap-x-2.5 gap-y-1 border-t border-dashed border-line-2 pt-[18px]">
                  {b.from != null && b.fromFull != null ? (
                    <>
                      <small className="text-[0.74rem] tracking-[0.1em] text-chrome-400 uppercase">From</small>
                      <b className="font-display text-[1.75rem] font-bold tracking-[-0.03em] text-chrome-100">{formatPrice(b.from)}</b>
                      {b.discountPercent > 0 && (
                        <>
                          <s className="text-[0.9rem] text-chrome-500">{formatPrice(b.fromFull)}</s>
                          <em className="rounded-full bg-[rgba(31,160,90,0.15)] px-2.5 py-[3px] text-[0.72rem] font-bold text-[#1a8f50] not-italic">
                            Save {b.discountPercent}%
                          </em>
                        </>
                      )}
                    </>
                  ) : (
                    <small className="text-[0.84rem] tracking-[0.1em] text-chrome-400 uppercase">Price announced at launch</small>
                  )}
                </div>

                {b.comingSoon ? (
                  <span aria-disabled className={cn(siteButton({ variant: 'ghost' }), 'w-full cursor-not-allowed opacity-60')}>
                    Coming soon
                  </span>
                ) : (
                  <Link href={`/quote?bundle=${b.id}`} className={`${siteButton()} w-full`}>
                    Book this bundle <ArrowRight />
                  </Link>
                )}
              </article>
            </Reveal>
          )
        })}
      </div>
    </SectionShell>
  )
}
