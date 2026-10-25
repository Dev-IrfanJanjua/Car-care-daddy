'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

type TrustItem = { title: string; sub?: string }

/**
 * The sticky header frame plus its rotating announcement bar.
 *
 * The bar sits above the main row and folds away once the page scrolls, as in
 * the design; the frame gets a soft shadow at that point so it reads as lifted.
 * Everything inside (logo, nav, buttons) is passed in as children so the
 * server-rendered parts stay on the server.
 */
export function HeaderShell({ trust, children }: { trust: TrustItem[]; children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false)
  const [i, setI] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (trust.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI((n) => n + 1), 4200)
    return () => clearInterval(t)
  }, [trust.length])

  const item = trust.length ? trust[i % trust.length] : null

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur-xl backdrop-saturate-150 transition-shadow',
        scrolled && 'shadow-[0_1px_0_var(--line),0_18px_40px_-30px_rgba(18,32,46,0.25)]'
      )}
    >
      {item && (
        <div
          className={cn(
            'overflow-hidden border-b border-line bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--gold-500)_10%,transparent),transparent)] transition-[height,opacity] duration-300',
            scrolled ? 'h-0 border-transparent opacity-0' : 'h-8 opacity-100 sm:h-9'
          )}
          aria-live="polite"
        >
          <p
            key={i % trust.length}
            className="flex h-8 animate-in items-center justify-center gap-2 px-4 text-[0.72rem] whitespace-nowrap text-foreground duration-500 fade-in slide-in-from-bottom-1 sm:h-9 sm:text-[0.78rem]"
          >
            <ShieldCheck aria-hidden className="size-[15px] text-gold-ink" />
            <b className="font-semibold">{item.title}</b>
            {item.sub && <span className="hidden text-chrome-400 sm:inline">· {item.sub}</span>}
            {trust.length > 1 && (
              <span aria-hidden className="ml-2 hidden gap-1 sm:inline-flex">
                {trust.map((_, k) => (
                  <i
                    key={k}
                    className={cn(
                      'size-[5px] rounded-full',
                      k === i % trust.length ? 'bg-gold-500' : 'bg-line-2'
                    )}
                  />
                ))}
              </span>
            )}
          </p>
        </div>
      )}
      {children}
    </header>
  )
}
