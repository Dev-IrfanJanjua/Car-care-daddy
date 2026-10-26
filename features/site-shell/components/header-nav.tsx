'use client'

import { waLink, helpMessageForPath } from '@/lib/whatsapp/messages'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { siteButton } from '@/components/ui/site-button'
import { ThemeToggle } from '@/features/theme'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '@/components/icons/brand-icons'
import { MAIN_NAV_LINKS } from '@/lib/nav'
import { cn } from '@/lib/utils'

type Contact = {
  whatsappDisplay: string
  telHref: string
  whatsappUrl: string
  facebookUrl: string
  instagramUrl: string
}

// Every route here is top-level (no nested pages under /services etc.), so an
// exact match is always correct -- no prefix rule like the admin sidebar's
// isActiveHref needs for its nested settings pages.
function isActive(pathname: string, href: string) {
  return pathname === href
}

/**
 * The interactive half of the header: desktop nav + phone + Book Now, and the
 * mobile menu that holds the same set. Split from SiteHeader because this is
 * the only part that needs the client (usePathname for the active link, and
 * open state for the sheet) -- the logo and the header shell stay server-only.
 */
export function HeaderNav({ contact }: { contact: Contact }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const closeMenu = () => setOpen(false)

  return (
    <>
      <nav className="hidden items-center gap-1.5 lg:flex" aria-label="Primary">
        {MAIN_NAV_LINKS.map((link) => {
          const active = isActive(pathname, link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'rounded-full px-4 py-2 text-[0.92rem] font-medium transition-colors',
                active
                  ? 'bg-gold-500/10 text-foreground ring-1 ring-line-2 dk:bg-gold-500/14 dk:ring-gold-500/35'
                  : 'text-chrome-400 hover:bg-tint hover:text-foreground'
              )}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-2.5">
        <a href={contact.telHref} className={cn(siteButton({ variant: 'ghost', size: 'sm' }), 'hidden lg:inline-flex')}>
          <Phone className="text-gold-ink" />
          {contact.whatsappDisplay}
        </a>
        <Link href="/quote" className={cn(siteButton({ size: 'sm' }), 'hidden sm:inline-flex')}>
          Book now
        </Link>
        <ThemeToggle className="size-11 rounded-full border-line-2 bg-tint text-foreground hover:border-gold-500 hover:bg-tint hover:text-gold-ink" />

        <Sheet open={open} onOpenChange={setOpen}>
          <Button
            variant="outline"
            size="icon"
            aria-label="Open menu"
            nativeButton
            className="size-11 rounded-lg border-line-2 bg-transparent lg:hidden"
            render={<SheetTrigger />}
          >
            <Menu className="size-5" />
          </Button>

          <SheetContent side="right" className="flex flex-col bg-ink-950 px-0">
            <SheetHeader className="border-b border-border/60 px-5 pb-4">
              <SheetTitle>Car Aurum</SheetTitle>
              <SheetDescription>
                Doorstep windshield &amp; glass restoration in Lahore
              </SheetDescription>
            </SheetHeader>

            <nav className="flex flex-col gap-1 px-3 py-2" aria-label="Primary">
              {MAIN_NAV_LINKS.map((link) => {
                const active = isActive(pathname, link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'rounded-[10px] border px-4 py-3.5 font-display text-xl font-medium transition-colors',
                      active
                        ? 'border-line-2 bg-gold-500/10 text-gold-ink'
                        : 'border-transparent text-chrome-300 hover:bg-tint hover:text-chrome-100'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <div className="mt-auto flex flex-col gap-4 border-t border-border/60 px-5 py-5">
              <a
                href={contact.telHref}
                onClick={closeMenu}
                className="flex items-center gap-2 text-sm font-semibold text-chrome-100"
              >
                <Phone className="size-4 text-gold" />
                {contact.whatsappDisplay}
              </a>

              <Link href="/quote" onClick={closeMenu} className={cn(siteButton(), 'w-full')}>
                Book now
              </Link>

              <div className="flex items-center gap-3 pt-1">
                <a
                  href={contact.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex size-9 items-center justify-center rounded-lg bg-ink-800 text-chrome-300 ring-1 ring-border/60 transition-colors hover:text-gold"
                >
                  <FacebookIcon className="size-4" />
                </a>
                <a
                  href={contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex size-9 items-center justify-center rounded-lg bg-ink-800 text-chrome-300 ring-1 ring-border/60 transition-colors hover:text-gold"
                >
                  <InstagramIcon className="size-4" />
                </a>
                <a
                  href={waLink(contact.whatsappUrl, helpMessageForPath(pathname))}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex size-9 items-center justify-center rounded-lg bg-ink-800 text-chrome-300 ring-1 ring-border/60 transition-colors hover:text-gold"
                >
                  <WhatsAppIcon className="size-4" />
                </a>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
