import Link from 'next/link'
import Image from 'next/image'
import { getBusinessContact } from '@/lib/business-contact'
import { HeaderNav } from './header-nav'

/**
 * The site header, on every marketing page (home, services, gallery, about,
 * contact). A plain sticky dark bar at all times now -- the previous version
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
    <header className="sticky top-0 z-50 border-b border-border/60 bg-ink-950/95 backdrop-blur-lg supports-backdrop-filter:bg-ink-950/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          {/* The real emblem, cropped out of public/images/CarCareLogo.jpeg.
              The source is a JPEG with the dark studio backdrop baked in, so
              it sits in its own tile rather than floating on the bar -- a bare
              rectangle of near-black would otherwise read as a rendering
              fault. Swap in a transparent PNG/SVG when one exists and this
              wrapper can go. */}
          <span className="flex h-9 w-19 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink-950 shadow-sm shadow-ink-900/30 ring-1 ring-gold-hairline">
            <Image
              src="/images/logo-mark.jpg"
              alt=""
              width={1180}
              height={520}
              priority
              className="h-full w-full object-cover"
            />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight sm:text-lg">
              <span className="text-gold-ink">Car Care</span>{' '}
              <span className="text-foreground">Daddy</span>
            </span>
            <span className="text-[10px] font-semibold tracking-[0.18em] text-chrome-500 uppercase">
              Windshield Expert
            </span>
          </span>
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
