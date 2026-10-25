import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { WhatsAppIcon } from '@/components/icons/brand-icons'
import { siteButton } from '@/components/ui/site-button'

/**
 * Photo-backed heading band shared by the inner pages. Always a dark zone, so
 * the type stays cream on the photograph in both themes; `accent` is the part
 * of the headline in the brand colour. Pass `whatsappUrl` to add the Book now /
 * WhatsApp pair underneath.
 */
export function PageHero({
  image,
  crumb,
  eyebrow,
  title,
  accent,
  description,
  whatsappUrl,
  children,
}: {
  image: string
  crumb: string
  eyebrow: string
  title: string
  accent?: string
  description: string
  whatsappUrl?: string
  children?: ReactNode
}) {
  return (
    <section className="zone-dark relative isolate overflow-hidden text-center shadow-[inset_0_-1px_0_color-mix(in_oklab,var(--gold-500)_40%,transparent)]">
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover opacity-65 brightness-[1.15] saturate-[1.15]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,var(--ink-900)_0%,color-mix(in_oklab,var(--ink-900)_78%,transparent)_25%,color-mix(in_oklab,var(--ink-900)_30%,transparent)_65%,color-mix(in_oklab,var(--ink-900)_20%,transparent)_100%)]"
      />
      <div className="mx-auto max-w-[1200px] px-[18px] pt-16 pb-12 sm:px-6 sm:pt-[104px] sm:pb-20">
        <div className="mb-1.5 flex justify-center gap-2 text-[0.82rem] text-chrome-500">
          <Link href="/" className="hover:text-gold-ink">
            Home
          </Link>
          / <span>{crumb}</span>
        </div>
        <span className="inline-flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.3em] text-gold-ink uppercase before:h-px before:w-[34px] before:bg-current before:content-['']">
          {eyebrow}
        </span>
        <h1 className="mx-auto mt-4 mb-[18px] max-w-[18ch] font-display text-[clamp(1.8rem,3.8vw,3rem)] leading-[1.12] font-semibold tracking-[-0.03em] text-balance text-chrome-100">
          {title}
          {accent && (
            <>
              {' '}
              <span className="text-gold-ink">{accent}</span>
            </>
          )}
        </h1>
        <p className="mx-auto max-w-[60ch] text-[1.05rem] text-chrome-400">{description}</p>
        {whatsappUrl && (
          <div className="mt-[30px] flex flex-wrap justify-center gap-3">
            <Link href="/quote" className={siteButton()}>
              Book now
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={siteButton({ variant: 'ghost' })}>
              <WhatsAppIcon /> WhatsApp us
            </a>
          </div>
        )}
        {children}
      </div>
    </section>
  )
}
