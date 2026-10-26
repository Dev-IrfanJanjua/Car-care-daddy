'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeftRight } from 'lucide-react'
import { VideoPlayer } from '@/components/media/video-player'
import { BeforeAfterSlider } from '@/features/home'
import { siteButton } from '@/components/ui/site-button'
import { cn } from '@/lib/utils'
import type { GalleryItem } from '../types'

// Filter chips follow the service order; anything else sorts after.
const ORDER = ['windshield', 'glass', 'headlights', 'detailing']

// Gives the masonry its uneven rhythm; repeats, so any number of photos works.
const RATIOS = ['aspect-[4/3]', 'aspect-[4/5]', 'aspect-[1/1]', 'aspect-[4/3]', 'aspect-[3/4]', 'aspect-[16/11]']

/** Category chips (taken from the items' service) over a masonry of compare sliders. */
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const categories = useMemo(() => {
    const found = Array.from(new Set(items.map((i) => i.service).filter((s): s is string => !!s)))
    const rank = (c: string) => {
      const i = ORDER.indexOf(c.toLowerCase())
      return i === -1 ? ORDER.length : i
    }
    return found.sort((a, b) => rank(a) - rank(b))
  }, [items])
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
              {item.kind === 'video' && item.mediaUrl ? (
                <VideoPlayer src={item.mediaUrl} poster={item.posterUrl} title={item.title} />
              ) : item.kind === 'image' && item.mediaUrl ? (
                <Image
                  src={item.mediaUrl}
                  alt={item.title}
                  fill
                  priority={i < 3}
                  sizes="(min-width:1024px) 380px, (min-width:640px) 50vw, 100vw"
                  className="object-cover brightness-110 saturate-110"
                />
              ) : item.beforeUrl && item.afterUrl ? (
                <>
                  <BeforeAfterSlider
                    beforeSrc={item.beforeUrl}
                    afterSrc={item.afterUrl}
                    alt={item.title}
                    priority={i < 3}
                    sizes="(min-width:1024px) 380px, (min-width:640px) 50vw, 100vw"
                  />
                  <span className="pointer-events-none absolute top-3 left-3 z-[5] inline-flex items-center gap-1.5 rounded-lg border border-line-2 bg-ink-900/60 px-2.5 py-1 text-[0.68rem] font-bold tracking-[0.1em] text-chrome-100 uppercase backdrop-blur-md">
                    <ArrowLeftRight aria-hidden className="size-3 text-gold-ink" /> Before / After
                  </span>
                </>
              ) : null}
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
