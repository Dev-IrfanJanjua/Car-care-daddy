import Link from 'next/link'
import Image from 'next/image'
import { Mail, MapPin, Phone } from 'lucide-react'
import { getBusinessContact } from '@/lib/business-contact'
import { getServiceCatalog } from '@/lib/pricing/service-catalog'
import { MAIN_NAV_LINKS } from '@/lib/nav'
import { WARRANTY_YEARS } from '@/lib/contact'
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from './brand-icons'

const SOCIAL_ICON_CLASS =
  'flex size-9 items-center justify-center rounded-lg bg-ink-800 text-chrome-300 ring-1 ring-border/60 transition-colors hover:text-gold hover:ring-gold/40'

/**
 * The site footer, on every marketing page. Sits one shade below the page
 * (ink-950, the same darkest step the hero uses) so it reads as the floor of
 * the site rather than just another card.
 *
 * Supersedes the old MobileTabBar: that sticky bottom strip surfaced the same
 * contact links this footer now carries in its "Contact us" column and social
 * row, and having both a fixed bar and a full footer repeat the same three
 * links a scroll apart. Removed rather than layered on top of this.
 */
export async function SiteFooter() {
  const [contact, { services }] = await Promise.all([getBusinessContact(), getServiceCatalog()])

  // Only what customers can actually book -- coming_soon has no price to send
  // them into the quote flow with.
  const bookableServices = services.filter((s) => !s.coming_soon)

  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border/60 bg-ink-950">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-19 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink-950 ring-1 ring-gold-hairline">
                <Image
                  src="/images/logo-mark.jpg"
                  alt=""
                  width={1180}
                  height={520}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="text-base font-bold tracking-tight">
                <span className="text-gold-ink">Car Care</span>{' '}
                <span className="text-foreground">Daddy</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-chrome-500">
              Professional windshield and glass restoration, delivered to your doorstep anywhere
              in Lahore. Every job backed by a {WARRANTY_YEARS}-year results warranty.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={contact.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className={SOCIAL_ICON_CLASS}
              >
                <FacebookIcon className="size-4" />
              </a>
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={SOCIAL_ICON_CLASS}
              >
                <InstagramIcon className="size-4" />
              </a>
              <a
                href={contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className={SOCIAL_ICON_CLASS}
              >
                <WhatsAppIcon className="size-4" />
              </a>
              <a href={`mailto:${contact.email}`} aria-label="Email" className={SOCIAL_ICON_CLASS}>
                <Mail className="size-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold tracking-[0.14em] text-gold-ink uppercase">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5">
              {MAIN_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-chrome-300 transition-colors hover:text-chrome-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold tracking-[0.14em] text-gold-ink uppercase">
              Services
            </h3>
            <ul className="mt-4 space-y-2.5">
              {bookableServices.map((service) => (
                <li key={service.id}>
                  {/* Straight to the quote flow, not the (still placeholder)
                      /services page -- this list exists to get someone a real
                      price, not to describe the catalog. */}
                  <Link
                    href="/quote"
                    className="text-sm text-chrome-300 transition-colors hover:text-chrome-100"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold tracking-[0.14em] text-gold-ink uppercase">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-chrome-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
                Doorstep service across Lahore
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-gold" />
                <a href={`tel:+${contact.whatsappNumber}`} className="hover:text-chrome-100">
                  {contact.whatsappDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-gold" />
                <a href={`mailto:${contact.email}`} className="hover:text-chrome-100">
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-chrome-500 sm:flex-row">
          <p>&copy; {year} Car Care Daddy. All rights reserved.</p>
          <p className="italic">Your Car, Our Care.</p>
        </div>
      </div>
    </footer>
  )
}
