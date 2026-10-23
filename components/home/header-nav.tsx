'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from './brand-icons'
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
      <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
        {MAIN_NAV_LINKS.map((link) => {
          const active = isActive(pathname, link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative py-1 text-sm font-semibold tracking-wide uppercase transition-colors',
                active ? 'text-gold-ink' : 'text-chrome-300 hover:text-chrome-100'
              )}
            >
              {link.label}
              {active && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1.5 h-0.5 rounded-full bg-gold-500"
                />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="hidden items-center gap-6 lg:flex">
        <a
          href={contact.telHref}
          className="flex items-center gap-2 text-sm font-semibold text-chrome-100 transition-colors hover:text-gold-ink"
        >
          <Phone className="size-4 text-gold" />
          {contact.whatsappDisplay}
        </a>
        <Button className="shadow-md shadow-ink-950/20" render={<Link href="/quote" />}>
          Book Now
        </Button>
      </div>

      {/* Below lg: nav + phone move into a drawer, Book Now stays on the bar --
          the one action worth never hiding behind a menu tap. */}
      <div className="flex items-center gap-2 lg:hidden">
        <Button size="sm" className="shadow-md shadow-ink-950/20" render={<Link href="/quote" />}>
          Book Now
        </Button>

        <Sheet open={open} onOpenChange={setOpen}>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            render={<SheetTrigger />}
          >
            <Menu className="size-5" />
          </Button>

          <SheetContent side="right" className="flex flex-col bg-ink-950 px-0">
            <SheetHeader className="border-b border-border/60 px-5 pb-4">
              <SheetTitle>Car Care Daddy</SheetTitle>
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
                      'rounded-lg px-3 py-2.5 text-base font-semibold tracking-wide uppercase transition-colors',
                      active
                        ? 'bg-ink-800 text-gold-ink'
                        : 'text-chrome-300 hover:bg-ink-800 hover:text-chrome-100'
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

              <Button
                className="w-full shadow-md shadow-ink-950/20"
                render={<Link href="/quote" onClick={closeMenu} />}
              >
                Book Now
              </Button>

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
                  href={contact.whatsappUrl}
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
