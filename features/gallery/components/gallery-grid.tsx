'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { BeforeAfterSlider } from '@/features/home'
import { siteButton } from '@/components/ui/site-button'
import { cn } from '@/lib/utils'
import type { GalleryItem } from '../types'

// Gives the masonry its uneven rhythm; repeats, so any number of photos works.
const RATIOS = ['aspect-[4/3]', 'aspect-[4/5]', 'aspect-[1/1]', 'aspect-[4/3]', 'aspect-[3/4]', 'aspect-[16/11]']

/** Category chips (taken from the items' service) over a masonry of compare sliders. */
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.service).filter((s): s is string => !!s))), [items])
  const [active, setActive] = useState<string | null>(null)
  const shown = active ? items.filter((i) => i.service === active) : items

  return (
    <section className="mx-auto max-w-[1200px] px-[18px] py-8 sm:px-6 sm:py-12">
      {categories.length > 1 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2.5" role="group" aria-label="Filter by service">
          {[null, ...categories].map((c) => (
            <button
              key={c ?? 'all'}
              type="button"
              aria-pressed={active === c}
              onClick={() => setActive(c)}
              className={cn(
                'rounded-full border px-[18px] py-2 text-[0.86rem] font-medium transition',
                active === c
                  ? 'border-gold-500 bg-gold-500 text-ink-950'
                  : 'border-line-2 bg-card text-chrome-400 hover:border-gold-500 hover:text-gold-ink'
              )}
            >
              {c ?? 'All'}
            </button>
          ))}
        </div>
      )}

      <div className="columns-1 gap-[18px] sm:columns-2 lg:columns-3">
        {shown.map((item, i) => (
          <figure
            key={item.id}
            className="mb-[18px] break-inside-avoid overflow-hidden rounded-2xl border border-line bg-card dk:rounded-sm dk:border-gold-500/45"
          >
            <div className={cn('relative', RATIOS[i % RATIOS.length])}>
              <BeforeAfterSlider
                beforeSrc={item.beforeUrl}
                afterSrc={item.afterUrl}
                alt={item.title}
                priority={i < 3}
                sizes="(min-width:1024px) 380px, (min-width:640px) 50vw, 100vw"
              />
            </div>
            <figcaption className="px-4 py-3.5">
              <p className="font-display font-medium text-chrome-100">{item.title}</p>
              {item.service && <p className="text-sm text-chrome-400">{item.service}</p>}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/quote" className={siteButton()}>
          Get results like these
        </Link>
      </div>
    </section>
  )
}
