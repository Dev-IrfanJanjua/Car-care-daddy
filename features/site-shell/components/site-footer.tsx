import { waLink, SITE_MESSAGES } from '@/lib/whatsapp/messages'
import Link from 'next/link'
import Image from 'next/image'
import { getBusinessContact } from '@/lib/business-contact'
import { getServiceCatalog } from '@/lib/pricing/service-catalog'
import { MAIN_NAV_LINKS } from '@/lib/nav'
import { FloatingActions } from './floating-actions'
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '@/components/icons/brand-icons'

const SOCIAL =
  'grid size-[42px] place-items-center rounded-full border border-line-2 text-foreground transition-colors hover:border-gold-500 hover:bg-gold-500 hover:text-gold-foreground [&_svg]:size-[18px]'

const H4 = 'mb-[18px] text-[0.78rem] font-semibold tracking-[0.16em] text-gold-ink uppercase'
const LINK = 'text-[0.92rem] text-chrome-400 transition-colors hover:text-gold-ink'

/**
 * The site footer, on every marketing page. Always a dark band: deep green in
 * the light theme, near-black in the dark one (as in the design).
 */
export async function SiteFooter() {
  const [contact, { services }] = await Promise.all([getBusinessContact(), getServiceCatalog()])

  // Only what customers can actually book -- coming_soon has no price to send
  // them into the quote flow with.
  const bookableServices = services.filter((s) => !s.coming_soon)
  const year = new Date().getFullYear()

  return (
    <footer className="zone-dark border-t border-line bg-ink-900 pt-16 pb-[calc(1.75rem+76px)] sm:pt-20 sm:pb-7 dk:bg-[#060608]">
      <div className="mx-auto max-w-[1200px] px-[18px] sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-12">
          <div>
            <Link href="/" className="inline-flex items-center" aria-label="Car Aurum home">
              <Image
                src="/images/logo-light.png"
                alt="Car Aurum — Premium Auto Care"
                width={720}
                height={305}
                className="logo-on-light h-[54px] w-auto"
              />
              <Image
                src="/images/logo-dark.png"
                alt="Car Aurum — Premium Auto Care"
                width={720}
                height={305}
                className="logo-on-dark h-[54px] w-auto"
              />
            </Link>
            <p className="mt-[18px] max-w-[34ch] text-[0.92rem] text-chrome-400">
              Doorstep CeO₂ windshield restoration, glass polishing, headlight restoration and
              detailing — Lahore.
            </p>
            <div className="mt-5 flex gap-2.5">
              <a href={contact.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={SOCIAL}>
                <FacebookIcon />
              </a>
              <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={SOCIAL}>
                <InstagramIcon />
              </a>
              <a href={waLink(contact.whatsappUrl, SITE_MESSAGES.footer)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={SOCIAL}>
                <WhatsAppIcon />
              </a>
            </div>
          </div>

          <div>
            <h3 className={H4}>Explore</h3>
            <ul className="space-y-2.5">
              {MAIN_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={LINK}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={H4}>Services</h3>
            <ul className="space-y-2.5">
              {bookableServices.map((service) => (
                <li key={service.id}>
                  <Link href="/services" className={LINK}>
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={H4}>Contact</h3>
            <ul className="space-y-2.5">
              <li>
                <a href={`tel:+${contact.whatsappNumber}`} className={LINK}>
                  {contact.whatsappDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className={LINK}>
                  {contact.email}
                </a>
              </li>
              <li className="text-[0.92rem] text-chrome-400">Doorstep service across Lahore</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap justify-between gap-4 border-t border-line pt-6 text-[0.82rem] text-chrome-500/80">
          <span>&copy; {year} Car Aurum. All rights reserved.</span>
          <Link href="/login" className="transition-colors hover:text-gold-ink">
            Admin login
          </Link>
        </div>
      </div>
      <FloatingActions whatsappUrl={contact.whatsappUrl} telHref={`tel:+${contact.whatsappNumber}`} />
    </footer>
  )
}
