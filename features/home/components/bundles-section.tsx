import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { Reveal } from '@/components/motion/reveal'
import { siteButton } from '@/components/ui/site-button'
import { formatPrice } from '@/lib/format'
import { SectionHead, SectionShell } from './section-head'

export type HomeBundle = {
  id: string
  name: string
  description: string | null
  /** cheapest price across vehicle classes */
  fromPrice: number | null
}

/**
 * Packages: the services the owner has flagged `is_package`, shown as cards.
 * Nothing here is invented -- no strike-through price or "save %" is drawn,
 * because the database holds a single price per class and no list price to
 * compare it with. The section does not render when there are no packages.
 */
export function BundlesSection({ bundles }: { bundles: HomeBundle[] }) {
  if (bundles.length === 0) return null

  return (
    <SectionShell id="bundles">
      <Reveal>
        <SectionHead
          center
          eyebrow="Bundles"
          title="Bundle &amp;"
          accent="save more"
          lead="Combine services in one doorstep visit and save — your exact price is confirmed for your car before you pay."
        />
      </Reveal>

      <div className="flex flex-wrap justify-center gap-[30px] pt-3 lg:gap-[22px]">
        {bundles.map((b, i) => (
          <Reveal key={b.id} delay={i * 0.08} className="flex w-full max-w-[520px] lg:w-[calc((100%-44px)/3)] lg:max-w-none">
            <article className="relative flex w-full flex-col rounded-[26px] border border-line bg-card px-7 pt-[34px] pb-7 shadow-[0_22px_50px_-36px_rgba(18,32,46,0.35)] transition duration-300 hover:-translate-y-1.5 hover:border-gold-500/45 dk:rounded-sm dk:border-gold-500/45">
              <span className="absolute -top-3 left-7 rounded-full bg-gold-500 px-3.5 py-1 text-[0.7rem] font-bold tracking-[0.1em] text-gold-foreground uppercase dk:rounded-xs">
                Bundle
              </span>
              <h3 className="mb-2 font-display text-[1.35rem] font-semibold text-chrome-100">{b.name}</h3>
              {b.description && <p className="mb-[18px] text-[0.92rem] text-chrome-400">{b.description}</p>}
              <ul className="mb-[22px] grid gap-2">
                <li className="flex gap-2.5 text-[0.92rem] font-medium text-chrome-100">
                  <Check aria-hidden className="mt-0.5 size-[18px] shrink-0 rounded-full bg-gold-500/20 p-[3px] text-gold-ink" strokeWidth={3} />
                  Priced for your car at booking
                </li>
                <li className="flex gap-2.5 text-[0.92rem] font-medium text-chrome-100">
                  <Check aria-hidden className="mt-0.5 size-[18px] shrink-0 rounded-full bg-gold-500/20 p-[3px] text-gold-ink" strokeWidth={3} />
                  One doorstep visit
                </li>
              </ul>
              {b.fromPrice != null && (
                <div className="mt-auto mb-[18px] flex flex-wrap items-baseline gap-x-2.5 gap-y-1 border-t border-dashed border-line-2 pt-[18px]">
                  <small className="text-[0.74rem] tracking-[0.1em] text-chrome-400 uppercase">From</small>
                  <b className="font-display text-[1.75rem] font-bold tracking-[-0.03em] text-chrome-100">
                    {formatPrice(b.fromPrice)}
                  </b>
                </div>
              )}
              <Link href="/quote" className={`${siteButton()} w-full ${b.fromPrice == null ? 'mt-auto' : ''}`}>
                Book this bundle <ArrowRight />
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  )
}
