import Link from 'next/link'
import Image from 'next/image'
import { getBusinessContact } from '@/lib/business-contact'
import { HeaderNav } from './header-nav'

/**
 * The site header, on every marketing page (home, services, gallery, about,
 * contact). A plain sticky bar at all times now -- the previous version
 * floated transparent over the homepage's hero video and solidified on
 * scroll, which existed only because that hero was a full-bleed video sitting
 * behind a fixed header. The new hero has its own gradient background and
 * sits *below* this bar in normal flow, like every other page, so that
 * scroll-driven transparency logic is gone along with it.
 *
 * Async server component: the phone number is a per-request read of
 * /admin/settings (through the cached getBusinessContact), and the only
 * interactive piece -- the nav's active-link state and the mobile sheet --
 * is split out into HeaderNav so this part never needs to be a client
 * component.
 */
export async function SiteHeader() {
  const contact = await getBusinessContact()

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-lg supports-backdrop-filter:bg-background/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo-light.png"
            alt="Car Aurum — Premium Auto Care"
            width={720}
            height={305}
            priority
            className="logo-on-light h-11 w-auto sm:h-12"
          />
          <Image
            src="/images/logo-dark.png"
            alt="Car Aurum — Premium Auto Care"
            width={720}
            height={305}
            priority
            className="logo-on-dark h-11 w-auto sm:h-12"
          />
        </Link>

        <HeaderNav
          contact={{
            whatsappDisplay: contact.whatsappDisplay,
            telHref: `tel:+${contact.whatsappNumber}`,
            whatsappUrl: contact.whatsappUrl,
            facebookUrl: contact.facebookUrl,
            instagramUrl: contact.instagramUrl,
          }}
        />
      </div>
    </header>
  )
}
