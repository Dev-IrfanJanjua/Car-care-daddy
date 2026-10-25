import Link from 'next/link'
import Image from 'next/image'
import { getBusinessContact } from '@/lib/business-contact'
import { HeaderShell } from './header-shell'
import { HeaderNav } from './header-nav'

// The announcement bar's rotating lines. Copy, not data -- the numbers in it
// (warranty length, hours) never change per customer.
const TRUST = [
  { title: '100% optical clarity', sub: 'Professional windshield polishing & restoration' },
  { title: '3-year results warranty', sub: 'On every windshield and glass restoration' },
  { title: 'Free doorstep service', sub: 'Anywhere in Lahore' },
]

/**
 * The site header, on every marketing page: announcement bar, logo, pill
 * navigation, phone / Book now / theme toggle.
 *
 * Async server component -- the phone number is a per-request read of
 * /admin/settings (through the cached getBusinessContact). The interactive
 * pieces (scroll state, rotating bar, active link, mobile drawer) are client
 * components that receive the server-rendered logo as children.
 */
export async function SiteHeader() {
  const contact = await getBusinessContact()

  return (
    <HeaderShell trust={TRUST}>
      <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between gap-6 px-[18px] sm:h-[76px] sm:px-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Car Aurum home">
          <Image
            src="/images/logo-light.png"
            alt="Car Aurum — Premium Auto Care"
            width={720}
            height={305}
            priority
            className="logo-on-light h-10 w-auto sm:h-[58px]"
          />
          <Image
            src="/images/logo-dark.png"
            alt="Car Aurum — Premium Auto Care"
            width={720}
            height={305}
            priority
            className="logo-on-dark h-10 w-auto sm:h-[58px]"
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
    </HeaderShell>
  )
}
