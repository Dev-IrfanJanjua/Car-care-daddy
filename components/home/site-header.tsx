'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * `overlay` floats the header over a dark full-bleed hero: transparent with a
 * white wordmark at the top of the page, swapping to the normal light bar once
 * you scroll past the fold. Only the homepage has such a hero -- every other
 * route renders the plain sticky bar, so the prop defaults off.
 */
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!overlay) return
    // Swap near the bottom of the hero rather than after a few pixels: the
    // translucent light bar over the still-dark hero reads as a muddy grey
    // band. The hero is min-h-[92svh], so 75% of the viewport is safely
    // inside it, and reading innerHeight per call keeps this right on resize.
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.75)
    // Fire once: a reload restores scroll position before this effect runs.
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [overlay])

  const floating = overlay && !scrolled

  return (
    <header
      className={cn(
        'z-50 transition-colors duration-300',
        floating
          ? 'fixed inset-x-0 top-0 border-b border-transparent bg-transparent'
          : overlay
            ? 'fixed inset-x-0 top-0 border-b border-border/60 bg-background/70 backdrop-blur-lg supports-backdrop-filter:bg-background/60'
            : 'sticky top-0 border-b border-border/60 bg-background/70 backdrop-blur-lg supports-backdrop-filter:bg-background/60'
      )}
    >
      {/* A fully transparent bar lets hero copy scroll right through the
          wordmark. This gradient gives whatever passes underneath a dark bed
          without reintroducing a visible header block. */}
      {floating && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-linear-to-b from-navy-950/90 via-navy-950/55 to-transparent"
        />
      )}

      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-gold-300 via-gold-500 to-gold-700 text-navy-900 shadow-sm shadow-gold-700/30 ring-1 ring-gold-hairline">
            <Sparkles className="size-4" />
          </span>
          <span
            className={cn(
              'text-lg font-bold tracking-tight transition-colors duration-300',
              floating ? 'text-white' : 'text-foreground'
            )}
          >
            Car Care Daddy
          </span>
        </Link>

        <Button
          size="lg"
          className={cn(
            'shadow-md',
            floating
              ? 'border-gold-400 bg-gold text-gold-foreground shadow-navy-950/40 hover:border-gold-300 hover:bg-gold-400'
              : 'shadow-navy-900/20'
          )}
          render={<Link href="/quote" />}
        >
          Book Now
        </Button>
      </div>
    </header>
  )
}
