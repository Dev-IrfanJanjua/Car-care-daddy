'use client'

import { usePathname } from 'next/navigation'
import { waLink, helpMessageForPath } from '@/lib/whatsapp/messages'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import { WhatsAppIcon } from '@/components/icons/brand-icons'
import { siteButton } from '@/components/ui/site-button'
import { cn } from '@/lib/utils'

/**
 * Two always-reachable contact shortcuts:
 *  - a round WhatsApp button, bottom-right, on larger screens;
 *  - a Call / WhatsApp / Book now bar along the bottom of a phone, which slides
 *    in once the visitor has scrolled past the hero.
 */
export function FloatingActions({ whatsappUrl: baseUrl, telHref }: { whatsappUrl: string; telHref: string }) {
  const pathname = usePathname()
  const whatsappUrl = waLink(baseUrl, helpMessageForPath(pathname))
  const [bar, setBar] = useState(false)

  useEffect(() => {
    const onScroll = () => setBar(window.scrollY > 380)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group fixed right-[22px] bottom-[22px] z-40 hidden size-[60px] place-items-center rounded-full bg-[#25D366] shadow-[0_14px_34px_-8px_rgba(37,211,102,0.7)] transition hover:scale-[1.08] hover:-rotate-6 sm:grid"
      >
        <WhatsAppIcon className="size-[30px] text-white" />
        <span
          aria-hidden
          className="absolute -inset-1.5 animate-ping rounded-full border-2 border-[#25D366] opacity-30 motion-reduce:hidden"
        />
      </a>

      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-line-2 bg-ink-900/95 px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))] backdrop-blur-xl transition-transform duration-300 sm:hidden',
          bar ? 'translate-y-0' : 'translate-y-[110%]'
        )}
      >
        <a href={telHref} className="flex min-w-[62px] flex-col items-center gap-0.5 text-[0.68rem] font-semibold text-chrome-400">
          <Phone className="size-5 text-gold-ink" />
          Call
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-[62px] flex-col items-center gap-0.5 text-[0.68rem] font-semibold text-chrome-400"
        >
          <WhatsAppIcon className="size-5 text-gold-ink" />
          WhatsApp
        </a>
        <Link href="/quote" className={cn(siteButton(), 'h-12 flex-1')}>
          Book now
        </Link>
      </div>
    </>
  )
}
