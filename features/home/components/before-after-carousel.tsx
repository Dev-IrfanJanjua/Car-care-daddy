'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowLeftRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BeforeAfterSlider } from './before-after-slider'

export type CarouselItem = {
  id: string
  title: string
  /** service label shown above the title */
  category: string
  before: string
  after: string
}

/**
 * Full-width before/after carousel. Auto-advances every 6.5 s (paused while
 * hovered, while the tab is hidden, and for reduced-motion visitors); dots,
 * arrows and a horizontal swipe move it by hand. A drag that starts on a
 * comparison handle belongs to the handle, not the swipe.
 */
export function BeforeAfterCarousel({ items }: { items: CarouselItem[] }) {
  const n = items.length
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const startX = useRef<number | null>(null)

  const go = useCallback((i: number) => setIdx(((i % n) + n) % n), [n])

  useEffect(() => {
    if (n < 2 || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => {
      if (!document.hidden) setIdx((i) => (i + 1) % n)
    }, 6500)
    return () => clearInterval(t)
  }, [n, paused, idx])

  return (
    <div className="relative">
      <div
        className="overflow-hidden rounded-2xl border border-line-2 bg-black shadow-[0_24px_60px_-34px_rgba(70,48,12,0.38)] dk:rounded-sm dk:border-gold-500/45"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onPointerDown={(e) => {
          startX.current = (e.target as HTMLElement).closest('[data-compare]') ? null : e.clientX
        }}
        onPointerUp={(e) => {
          if (startX.current == null) return
          const dx = e.clientX - startX.current
          startX.current = null
          if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1))
        }}
      >
        <div
          className="flex transition-transform duration-[600ms] ease-[cubic-bezier(.65,0,.2,1)] will-change-transform"
          style={{ transform: `translateX(${-idx * 100}%)` }}
        >
          {items.map((it, i) => (
            <div key={it.id} className="zone-dark relative aspect-[4/3] w-full flex-none bg-black sm:aspect-video" aria-hidden={i !== idx}>
              <BeforeAfterSlider beforeSrc={it.before} afterSrc={it.after} alt={it.title} priority={i === 0} />

              <span className="pointer-events-none absolute top-5 left-5 z-[5] flex items-center gap-2 rounded-[9px] border border-line-2 bg-ink-900/60 px-3.5 py-[7px] text-[0.72rem] font-bold tracking-[0.1em] text-chrome-100 uppercase backdrop-blur-md">
                <ArrowLeftRight aria-hidden className="size-3.5 text-gold-ink" />
                Before / After
              </span>

              {/* soft shade so the caption reads over any photo */}
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[62%] bg-[linear-gradient(0deg,color-mix(in_oklab,var(--ink-900)_95%,transparent)_0%,color-mix(in_oklab,var(--ink-900)_50%,transparent)_50%,transparent_100%)]" />
              <div className="pointer-events-none absolute right-3 bottom-3 left-3 z-[4] flex items-end sm:right-6 sm:bottom-6 sm:left-6">
                <div className="rounded-[11px] border border-line-2 bg-ink-900/60 px-3.5 py-2.5 backdrop-blur-md sm:px-[18px] sm:py-3">
                  {it.category && (
                    <small className="block text-[0.7rem] font-semibold tracking-[0.14em] text-gold-ink uppercase">{it.category}</small>
                  )}
                  <b className="font-display text-[1.05rem] font-semibold text-chrome-100">{it.title}</b>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {n > 1 && (
        <div className="mt-7 flex items-center justify-between gap-5">
          <div className="flex gap-2">
            {items.map((it, i) => (
              <button
                key={it.id}
                type="button"
                aria-label={`Show result ${i + 1}`}
                aria-current={i === idx}
                onClick={() => go(i)}
                className={cn('h-2.5 rounded-[9px] transition-all duration-300', i === idx ? 'w-[38px] bg-gold-500' : 'w-2.5 bg-line-2')}
              />
            ))}
          </div>
          <div className="flex gap-2.5">
            {([['Previous result', -1, ChevronLeft], ['Next result', 1, ChevronRight]] as const).map(([label, d, Icon]) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                onClick={() => go(idx + d)}
                className="grid size-[52px] place-items-center rounded-full border border-line-2 transition hover:border-gold-500 hover:bg-gold-500/12 hover:text-gold-ink"
              >
                <Icon className="size-5" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
